import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import type { StudentProfile } from "@/lib/student";
import type { Task } from "@/lib/homework/types";
import type { ExamResult } from "@/lib/marks/types";
import type { Project, Certificate } from "@/lib/portfolio/types";

/*
  ────────────────────────────────────────────────
  Cloud Data Service — Supabase-backed data access.

  This module is NOT wired into the UI yet. It provides
  the future implementation of the same data operations
  that the current localStorage services handle.

  When Supabase Auth is added in the next phase, the
  existing services (@/services/index.ts) will switch
  their storage implementation from localStorage to
  these functions — the UI won't change.

  ARCHITECTURE:

    Today:   UI → services → localStorage
    Future:  UI → services → cloud-data-service → Supabase

  Every function checks isSupabaseConfigured and
  isSupabaseAuthed() before executing. When not
  authenticated, it returns null (caller falls back).
  ────────────────────────────────────────────────
*/

/** True only when Supabase is configured AND a user is logged in. */
export async function isCloudReady(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data } = await supabase.auth.getUser();
  return !!data.user;
}

/** Returns the current authenticated user's ID, or null. */
export async function getUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/* ═══════════════════════════════════════════════════
   PROFILES
   ═══════════════════════════════════════════════════ */

export async function getProfileCloud(): Promise<StudentProfile | null> {
  const userId = await getUserId();
  if (!userId || !supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    name: data.name,
    board: data.board,
    stream: data.stream,
    photoDataUrl: data.photo_url ?? null,
    createdAt: data.created_at,
    studentId: data.student_id,
  };
}

export async function saveProfileCloud(profile: StudentProfile): Promise<boolean> {
  console.log("SAVE PROFILE CLOUD CALLED", profile);

  const userId = await getUserId();
  if (!userId || !supabase) return false;

  // Check whether this profile already exists
  const { data: existingProfile, error: findError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) {
    console.error("FIND PROFILE ERROR", findError);
    return false;
  }

  // Existing profile: update ONLY normal editable fields
  if (existingProfile) {
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        board: profile.board,
        stream: profile.stream,
        photo_url: profile.photoDataUrl,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("UPDATE PROFILE ERROR", error);
      return false;
    }

    return true;
  }

  // New profile: student_id can be set during creation
  const { error } = await supabase.from("profiles").insert({
    user_id: userId,
    name: profile.name,
    board: profile.board,
    stream: profile.stream,
    student_id: profile.studentId,
    photo_url: profile.photoDataUrl,
  });

  if (error) {
    console.error("INSERT PROFILE ERROR", error);
    return false;
  }

  return true;
}

/* ═══════════════════════════════════════════════════
   SYLLABUS PROGRESS
   ═══════════════════════════════════════════════════ */

export async function getSyllabusProgressCloud(): Promise<Record<string, "completed">> {
  const userId = await getUserId();
  if (!userId || !supabase) return {};

  const { data, error } = await supabase
    .from("syllabus_progress")
    .select("topic_id")
    .eq("user_id", userId);

  if (error || !data) return {};

  const progress: Record<string, "completed"> = {};
  for (const row of data) {
    progress[row.topic_id] = "completed";
  }
  return progress;
}

export async function toggleSyllabusTopicCloud(
  topicId: string,
  currentlyCompleted: boolean,
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !supabase) return false;

  if (currentlyCompleted) {
    const { error } = await supabase
      .from("syllabus_progress")
      .delete()
      .eq("user_id", userId)
      .eq("topic_id", topicId);
    return !error;
  } else {
    const { error } = await supabase.from("syllabus_progress").insert({
      user_id: userId,
      topic_id: topicId,
    });
    return !error;
  }
}

/* ═══════════════════════════════════════════════════
   PRACTICE PROGRESS (Maths + Science combined)
   ═══════════════════════════════════════════════════ */

export async function getPracticeProgressCloud(): Promise<{
  maths: Record<string, "completed">;
  science: Record<string, "completed">;
}> {
  const userId = await getUserId();
  if (!userId || !supabase) return { maths: {}, science: {} };

  const { data, error } = await supabase
    .from("practice_progress")
    .select("question_id, practice_type")
    .eq("user_id", userId);

  if (error || !data) return { maths: {}, science: {} };

  const maths: Record<string, "completed"> = {};
  const science: Record<string, "completed"> = {};
  for (const row of data) {
    if (row.practice_type === "maths") maths[row.question_id] = "completed";
    else science[row.question_id] = "completed";
  }
  return { maths, science };
}

export async function togglePracticeQuestionCloud(
  questionId: string,
  practiceType: "maths" | "science",
  currentlyCompleted: boolean,
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !supabase) return false;

  if (currentlyCompleted) {
    const { error } = await supabase
      .from("practice_progress")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId);
    return !error;
  } else {
    const { error } = await supabase.from("practice_progress").insert({
      user_id: userId,
      question_id: questionId,
      practice_type: practiceType,
    });
    return !error;
  }
}

/* ═══════════════════════════════════════════════════
   TASKS (Homework + Planner)
   ═══════════════════════════════════════════════════ */

export async function getTasksCloud(): Promise<Task[]> {
  const userId = await getUserId();
  if (!userId || !supabase) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    subject: row.subject as string,
    type: row.type as Task["type"],
    dueDate: row.due_date as string,
    dueTime: (row.due_time as string) || undefined,
    priority: row.priority as Task["priority"],
    notes: (row.notes as string) || "",
    completed: row.completed as boolean,
    recurrence: (row.recurrence as Task["recurrence"]) || undefined,
    reminder: (row.reminder as Task["reminder"]) || undefined,
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string) || null,
    updatedAt: (row.updated_at as string) || undefined,
  }));
}

export async function saveTaskCloud(task: Task): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !supabase) return false;

  const { error } = await supabase.from("tasks").upsert({
    id: task.id,
    user_id: userId,
    title: task.title,
    subject: task.subject,
    type: task.type,
    due_date: task.dueDate,
    due_time: task.dueTime ?? null,
    priority: task.priority,
    notes: task.notes,
    completed: task.completed,
    recurrence: task.recurrence ?? "None",
    reminder: task.reminder ?? "None",
    completed_at: task.completedAt,
  });

  return !error;
}

export async function deleteTaskCloud(taskId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !supabase) return false;

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  return !error;
}

/* ═══════════════════════════════════════════════════
   EXAM RESULTS
   ═══════════════════════════════════════════════════ */

export async function getResultsCloud(): Promise<ExamResult[]> {
  const userId = await getUserId();
  if (!userId || !supabase) return [];

  const { data, error } = await supabase
    .from("exam_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    examName: row.exam_name as string,
    examType: row.exam_type as ExamResult["examType"],
    subject: row.subject as string,
    marksObtained: Number(row.marks_obtained),
    maximumMarks: Number(row.maximum_marks),
    examDate: row.exam_date as string,
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
  }));
}

export async function saveResultCloud(result: ExamResult): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !supabase) return false;

  const { error } = await supabase.from("exam_results").upsert({
    id: result.id,
    user_id: userId,
    exam_name: result.examName,
    exam_type: result.examType,
    subject: result.subject,
    marks_obtained: result.marksObtained,
    maximum_marks: result.maximumMarks,
    exam_date: result.examDate,
    notes: result.notes,
  });

  return !error;
}

export async function deleteResultCloud(resultId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !supabase) return false;

  const { error } = await supabase
    .from("exam_results")
    .delete()
    .eq("id", resultId)
    .eq("user_id", userId);

  return !error;
}

/* ═══════════════════════════════════════════════════
   PROJECTS & CERTIFICATES
   ═══════════════════════════════════════════════════ */

export async function getProjectsCloud(): Promise<Project[]> {
  const userId = await getUserId();
  if (!userId || !supabase) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    subject: (row.subject as string) || "",
    date: (row.date as string) || "",
    link: (row.link as string) || "",
    createdAt: row.created_at as string,
  }));
}

export async function saveProjectCloud(project: Project): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !supabase) return false;

  const { error } = await supabase.from("projects").upsert({
    id: project.id,
    user_id: userId,
    title: project.title,
    description: project.description,
    subject: project.subject,
    date: project.date,
    link: project.link,
  });

  return !error;
}

export async function getCertificatesCloud(): Promise<Certificate[]> {
  const userId = await getUserId();
  if (!userId || !supabase) return [];

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    organization: (row.organization as string) || "",
    date: (row.date as string) || "",
    link: (row.link as string) || "",
    createdAt: row.created_at as string,
  }));
}

export async function saveCertificateCloud(cert: Certificate): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || !supabase) return false;

  const { error } = await supabase.from("certificates").upsert({
    id: cert.id,
    user_id: userId,
    title: cert.title,
    organization: cert.organization,
    date: cert.date,
    link: cert.link,
  });

  return !error;
}
