import { defineSubject } from "@/data/syllabus/build";

/*
  CBSE Class XII Mathematics (Subject Code 041) — Curriculum 2025-26.
  Source: cbseacademic.nic.in official curriculum PDF
  "Maths_SrSec_2025-26.pdf", CLASS – XII syllabus (Units I–VI).
*/
export const cbseMathematics = defineSubject("cbse", "mathematics", [
  {
    title: "Relations and Functions",
    unit: "Unit I: Relations and Functions",
    topics: [
      "Types of relations: reflexive relations",
      "Types of relations: symmetric relations",
      "Types of relations: transitive relations",
      "Types of relations: equivalence relations",
      "One to one functions",
      "Onto functions",
    ],
  },
  {
    title: "Inverse Trigonometric Functions",
    unit: "Unit I: Relations and Functions",
    topics: [
      "Definition of inverse trigonometric functions",
      "Range of inverse trigonometric functions",
      "Domain of inverse trigonometric functions",
      "Principal value branch",
      "Graphs of inverse trigonometric functions",
    ],
  },
  {
    title: "Matrices",
    unit: "Unit II: Algebra",
    topics: [
      "Concept, notation, order and equality of matrices",
      "Types of matrices; zero and identity matrix",
      "Transpose of a matrix",
      "Symmetric and skew symmetric matrices",
      "Operations on matrices: addition",
      "Operations on matrices: multiplication",
      "Operations on matrices: multiplication with a scalar",
      "Simple properties of addition, multiplication and scalar multiplication",
      "Non-commutativity of multiplication of matrices",
      "Existence of non-zero matrices whose product is the zero matrix (order 2)",
      "Invertible matrices and proof of the uniqueness of inverse, if it exists",
    ],
  },
  {
    title: "Determinants",
    unit: "Unit II: Algebra",
    topics: [
      "Determinant of a square matrix (up to 3 x 3 matrices)",
      "Minors and co-factors",
      "Applications of determinants in finding the area of a triangle",
      "Adjoint of a square matrix",
      "Inverse of a square matrix",
      "Consistency, inconsistency and number of solutions of system of linear equations by examples",
      "Solving system of linear equations in two or three variables (having unique solution) using inverse of a matrix",
    ],
  },
  {
    title: "Continuity and Differentiability",
    unit: "Unit III: Calculus",
    topics: [
      "Continuity and differentiability",
      "Chain rule",
      "Derivative of composite functions",
      "Derivatives of inverse trigonometric functions",
      "Derivative of implicit functions",
      "Concept of exponential and logarithmic functions",
      "Derivatives of logarithmic and exponential functions",
      "Logarithmic differentiation",
      "Derivative of functions expressed in parametric forms",
      "Second order derivatives",
    ],
  },
  {
    title: "Applications of Derivatives",
    unit: "Unit III: Calculus",
    topics: [
      "Rate of change of quantities",
      "Increasing and decreasing functions",
      "Maxima and minima (first derivative test motivated geometrically)",
      "Maxima and minima (second derivative test given as a provable tool)",
      "Simple problems illustrating basic principles and real-life situations",
    ],
  },
  {
    title: "Integrals",
    unit: "Unit III: Calculus",
    topics: [
      "Integration as inverse process of differentiation",
      "Integration of a variety of functions by substitution",
      "Integration by partial fractions",
      "Integration by parts",
      "Evaluation of simple integrals of the prescribed standard types and problems based on them",
      "Fundamental Theorem of Calculus (without proof)",
      "Basic properties of definite integrals",
      "Evaluation of definite integrals",
    ],
  },
  {
    title: "Applications of the Integrals",
    unit: "Unit III: Calculus",
    topics: [
      "Area under simple curves, especially lines",
      "Area under circles (standard form only)",
      "Area under parabolas (standard form only)",
      "Area under ellipses (standard form only)",
    ],
  },
  {
    title: "Differential Equations",
    unit: "Unit III: Calculus",
    topics: [
      "Definition, order and degree of a differential equation",
      "General and particular solutions of a differential equation",
      "Solution of differential equations by method of separation of variables",
      "Solutions of homogeneous differential equations of first order and first degree",
      "Solutions of linear differential equation of the type dy/dx + py = q",
      "Solutions of linear differential equation of the type dx/dy + px = q",
    ],
  },
  {
    title: "Vectors",
    unit: "Unit IV: Vectors and Three-dimensional Geometry",
    topics: [
      "Vectors and scalars; magnitude and direction of a vector",
      "Direction cosines and direction ratios of a vector",
      "Types of vectors (equal, unit, zero, parallel and collinear vectors)",
      "Position vector of a point; negative of a vector",
      "Components of a vector",
      "Addition of vectors",
      "Multiplication of a vector by a scalar",
      "Position vector of a point dividing a line segment in a given ratio",
      "Scalar (dot) product of vectors: definition, geometrical interpretation, properties and application",
      "Vector (cross) product of vectors",
    ],
  },
  {
    title: "Three-dimensional Geometry",
    unit: "Unit IV: Vectors and Three-dimensional Geometry",
    topics: [
      "Direction cosines and direction ratios of a line joining two points",
      "Cartesian equation and vector equation of a line",
      "Skew lines",
      "Shortest distance between two lines",
      "Angle between two lines",
    ],
  },
  {
    title: "Linear Programming",
    unit: "Unit V: Linear Programming Problem",
    topics: [
      "Introduction and related terminology such as constraints, objective function, optimisation",
      "Graphical method of solution for problems in two variables",
      "Feasible and infeasible regions (bounded or unbounded)",
      "Feasible and infeasible solutions",
      "Optimal feasible solutions (up to three non-trivial constraints)",
    ],
  },
  {
    title: "Probability",
    unit: "Unit VI: Probability",
    topics: [
      "Conditional probability",
      "Multiplication theorem on probability",
      "Independent events",
      "Total probability",
      "Bayes' theorem",
    ],
  },
]);
