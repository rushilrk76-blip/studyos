import { defineSubject } from "@/data/syllabus/build";

/*
  RBSE (BSER Ajmer) Class 12 Mathematics — Subject Code 15,
  पाठ्यक्रम सत्र 2025-2026.
  Source: official BSER syllabus document "12_2026.pdf", गणित / MATHEMATICS
  section (इकाई 1–6). English topic names transcribed from that document.

  NOTE: RBSE differs from CBSE here — e.g. RBSE explicitly retains
  "Properties of Inverse Trigonometric Functions" and
  "Applications of Determinants and Matrices", which the CBSE 2025-26
  rationalised syllabus does not list.
*/
export const rbseMathematics = defineSubject("rbse", "mathematics", [
  {
    title: "Relations and Functions",
    unit: "इकाई 1: Relations and Functions",
    topics: [
      "Introduction",
      "Types of relations",
      "Types of functions",
      "Composition of functions",
      "Invertible functions",
    ],
  },
  {
    title: "Inverse Trigonometric Functions",
    unit: "इकाई 1: Relations and Functions",
    topics: [
      "Introduction",
      "Basic concepts",
      "Properties of inverse trigonometric functions",
    ],
  },
  {
    title: "Matrices",
    unit: "इकाई 2: Algebra",
    topics: [
      "Introduction",
      "Matrix",
      "Types of matrices",
      "Operations on matrices",
      "Transpose of a matrix",
      "Symmetric and skew symmetric matrices",
      "Invertible matrices",
    ],
  },
  {
    title: "Determinants",
    unit: "इकाई 2: Algebra",
    topics: [
      "Introduction",
      "Determinant",
      "Area of a triangle",
      "Minors and co-factors",
      "Adjoint and inverse of a matrix",
      "Applications of determinants and matrices",
    ],
  },
  {
    title: "Continuity and Differentiability",
    unit: "इकाई 3: Calculus",
    topics: [
      "Introduction",
      "Continuity",
      "Differentiability",
      "Exponential and logarithmic functions",
      "Logarithmic differentiation",
      "Derivatives of functions in parametric forms",
      "Second order derivative",
    ],
  },
  {
    title: "Application of Derivatives",
    unit: "इकाई 3: Calculus",
    topics: [
      "Introduction",
      "Rate of change of quantities",
      "Increasing and decreasing functions",
      "Maxima and minima",
    ],
  },
  {
    title: "Integrals",
    unit: "इकाई 3: Calculus",
    topics: [
      "Introduction",
      "Integration as inverse process of differentiation",
      "Methods of integration",
      "Integrals of some particular functions",
      "Integration by partial fractions",
      "Integration by parts",
      "Definite integral",
      "Fundamental theorem of calculus",
      "Evaluation of definite integrals by substitution",
      "Some properties of definite integrals",
    ],
  },
  {
    title: "Applications of the Integrals",
    unit: "इकाई 3: Calculus",
    topics: ["Introduction", "Area under simple curves"],
  },
  {
    title: "Differential Equations",
    unit: "इकाई 3: Calculus",
    topics: [
      "Introduction",
      "Basic concepts",
      "General and particular solutions of a differential equation",
      "Methods of solving first order, first degree differential equations",
    ],
  },
  {
    title: "Vector Algebra",
    unit: "इकाई 4: Vectors and Three-Dimensional Geometry",
    topics: [
      "Introduction",
      "Some basic concepts",
      "Types of vectors",
      "Addition of vectors",
      "Multiplication of a vector by a scalar",
      "Product of two vectors",
    ],
  },
  {
    title: "Three Dimensional Geometry",
    unit: "इकाई 4: Vectors and Three-Dimensional Geometry",
    topics: [
      "Introduction",
      "Direction cosines and direction ratios of a line",
      "Equation of a line in space",
      "Angle between two lines",
      "Shortest distance between two lines",
    ],
  },
  {
    title: "Linear Programming",
    unit: "इकाई 5: Linear Programming",
    topics: [
      "Introduction",
      "Linear programming problems and its mathematical formulation",
    ],
  },
  {
    title: "Probability",
    unit: "इकाई 6: Probability",
    topics: [
      "Introduction to probability",
      "Conditional probability",
      "Multiplication theorem on probability",
      "Independent events",
      "Bayes' theorem",
    ],
  },
]);
