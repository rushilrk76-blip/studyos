import { defineConceptPractice } from "@/data/practice/build-concept";

/*
  CBSE Class XII Physics — numerical practice structure.

  Every chapter carries 30 numerical slots, distributed across the
  concepts/formulas that the chapter ACTUALLY contains. Category
  names are taken from the official CBSE 2025-26 topic list already
  transcribed in src/data/syllabus/cbse/physics.ts — nothing here
  is invented.

  Chapters marked "mixed" are ones CBSE treats largely
  qualitatively (Magnetism and Matter, Electromagnetic Waves,
  Semiconductor Electronics); their slots are still concept-grouped
  but include conceptual/derivation practice, not pure numericals.

  NO question text exists yet — these are tracking slots only.
*/
export const cbsePhysicsPractice = defineConceptPractice("cbse", "physics", [
  {
    chapterId: "cbse-physics-ch1",
    mode: "numerical",
    categories: [
      { key: "coulombs-law", name: "Coulomb's Law & Force Between Charges", count: 6 },
      { key: "superposition", name: "Superposition & Continuous Charge Distribution", count: 5 },
      { key: "electric-field", name: "Electric Field due to Point Charges", count: 5 },
      { key: "dipole", name: "Electric Dipole & Torque in Uniform Field", count: 6 },
      { key: "flux-gauss", name: "Electric Flux & Gauss's Theorem", count: 4 },
      { key: "gauss-applications", name: "Applications of Gauss's Law (Wire, Sheet, Shell)", count: 4 },
    ],
  },
  {
    chapterId: "cbse-physics-ch2",
    mode: "numerical",
    categories: [
      { key: "potential", name: "Potential due to Point Charge, Dipole & System", count: 6 },
      { key: "equipotential", name: "Equipotential Surfaces & Field–Potential Relation", count: 4 },
      { key: "potential-energy", name: "Electrostatic Potential Energy", count: 6 },
      { key: "capacitance", name: "Capacitance & Parallel Plate Capacitor", count: 5 },
      { key: "combination", name: "Combination of Capacitors (Series & Parallel)", count: 5 },
      { key: "dielectrics", name: "Dielectrics, Polarisation & Energy Stored", count: 4 },
    ],
  },
  {
    chapterId: "cbse-physics-ch3",
    mode: "numerical",
    categories: [
      { key: "current-drift", name: "Electric Current, Drift Velocity & Mobility", count: 4 },
      { key: "ohms-law", name: "Ohm's Law & V–I Characteristics", count: 4 },
      { key: "resistivity", name: "Resistivity, Conductivity & Temperature Dependence", count: 5 },
      { key: "energy-power", name: "Electrical Energy & Power", count: 4 },
      { key: "cells", name: "EMF, Internal Resistance & Combination of Cells", count: 5 },
      { key: "kirchhoff", name: "Kirchhoff's Rules", count: 5 },
      { key: "wheatstone", name: "Wheatstone Bridge", count: 3 },
    ],
  },
  {
    chapterId: "cbse-physics-ch4",
    mode: "numerical",
    categories: [
      { key: "biot-savart", name: "Biot–Savart Law & Circular Current Loop", count: 5 },
      { key: "amperes-law", name: "Ampere's Law & Straight Solenoid", count: 5 },
      { key: "force-moving-charge", name: "Force on a Moving Charge in Magnetic & Electric Fields", count: 5 },
      { key: "force-conductor", name: "Force on a Current-Carrying Conductor", count: 4 },
      { key: "parallel-currents", name: "Force Between Two Parallel Currents", count: 3 },
      { key: "torque-loop", name: "Torque on a Current Loop & Magnetic Dipole Moment", count: 5 },
      { key: "galvanometer", name: "Moving Coil Galvanometer & Its Conversion", count: 3 },
    ],
  },
  {
    chapterId: "cbse-physics-ch5",
    mode: "mixed",
    categories: [
      { key: "bar-magnet", name: "Bar Magnet & Magnetic Field Lines", count: 5 },
      { key: "equivalent-solenoid", name: "Bar Magnet as an Equivalent Solenoid", count: 4 },
      { key: "dipole-field", name: "Magnetic Field Intensity due to a Magnetic Dipole", count: 6 },
      { key: "dipole-torque", name: "Torque on a Magnetic Dipole in a Uniform Field", count: 6 },
      { key: "magnetic-materials", name: "Para-, Dia- & Ferromagnetic Substances", count: 5 },
      { key: "magnetisation", name: "Magnetisation & Effect of Temperature", count: 4 },
    ],
  },
  {
    chapterId: "cbse-physics-ch6",
    mode: "numerical",
    categories: [
      { key: "magnetic-flux", name: "Magnetic Flux", count: 5 },
      { key: "faradays-laws", name: "Faraday's Laws & Induced EMF", count: 7 },
      { key: "lenzs-law", name: "Lenz's Law & Direction of Induced Current", count: 6 },
      { key: "self-induction", name: "Self Induction", count: 6 },
      { key: "mutual-induction", name: "Mutual Induction", count: 6 },
    ],
  },
  {
    chapterId: "cbse-physics-ch7",
    mode: "numerical",
    categories: [
      { key: "peak-rms", name: "Peak & RMS Values of Current/Voltage", count: 5 },
      { key: "reactance-impedance", name: "Reactance & Impedance", count: 5 },
      { key: "lcr", name: "LCR Series Circuit (Phasors)", count: 6 },
      { key: "resonance", name: "Resonance", count: 5 },
      { key: "power-factor", name: "Power in AC Circuits, Power Factor & Wattless Current", count: 5 },
      { key: "generator-transformer", name: "AC Generator & Transformer", count: 4 },
    ],
  },
  {
    chapterId: "cbse-physics-ch8",
    mode: "mixed",
    categories: [
      { key: "displacement-current", name: "Displacement Current", count: 6 },
      { key: "em-wave-characteristics", name: "Electromagnetic Waves & Their Characteristics", count: 7 },
      { key: "transverse-nature", name: "Transverse Nature of Electromagnetic Waves", count: 5 },
      { key: "spectrum", name: "Electromagnetic Spectrum", count: 7 },
      { key: "spectrum-uses", name: "Uses of Electromagnetic Spectrum Regions", count: 5 },
    ],
  },
  {
    chapterId: "cbse-physics-ch9",
    mode: "numerical",
    categories: [
      { key: "mirrors", name: "Reflection & Spherical Mirrors (Mirror Formula)", count: 5 },
      { key: "refraction-tir", name: "Refraction, Total Internal Reflection & Optical Fibres", count: 5 },
      { key: "spherical-surfaces", name: "Refraction at Spherical Surfaces", count: 4 },
      { key: "lens-formula", name: "Thin Lens Formula & Lens Maker's Formula", count: 5 },
      { key: "magnification-power", name: "Magnification, Power & Combination of Thin Lenses", count: 5 },
      { key: "prism", name: "Refraction of Light Through a Prism", count: 3 },
      { key: "instruments", name: "Microscopes & Astronomical Telescopes", count: 3 },
    ],
  },
  {
    chapterId: "cbse-physics-ch10",
    mode: "numerical",
    categories: [
      { key: "huygens", name: "Huygens' Principle: Reflection & Refraction of Plane Waves", count: 6 },
      { key: "interference", name: "Interference & Coherent Sources", count: 6 },
      { key: "ydse", name: "Young's Double Slit Experiment & Fringe Width", count: 9 },
      { key: "diffraction", name: "Diffraction due to a Single Slit", count: 6 },
      { key: "central-maxima", name: "Width of Central Maxima", count: 3 },
    ],
  },
  {
    chapterId: "cbse-physics-ch11",
    mode: "numerical",
    categories: [
      { key: "photoelectric-effect", name: "Photoelectric Effect & Hertz–Lenard Observations", count: 6 },
      { key: "einstein-equation", name: "Einstein's Photoelectric Equation", count: 7 },
      { key: "work-function", name: "Work Function, Threshold Frequency & Stopping Potential", count: 7 },
      { key: "photon", name: "Photon Energy & Momentum", count: 5 },
      { key: "de-broglie", name: "Matter Waves & de Broglie Relation", count: 5 },
    ],
  },
  {
    chapterId: "cbse-physics-ch12",
    mode: "numerical",
    categories: [
      { key: "alpha-scattering", name: "Alpha-Particle Scattering & Distance of Closest Approach", count: 6 },
      { key: "rutherford-model", name: "Rutherford's Model of the Atom", count: 4 },
      { key: "bohr-radius", name: "Bohr Model & Radius of nth Orbit", count: 7 },
      { key: "velocity-energy", name: "Velocity & Energy of Electron in nth Orbit", count: 7 },
      { key: "hydrogen-spectra", name: "Hydrogen Line Spectra", count: 6 },
    ],
  },
  {
    chapterId: "cbse-physics-ch13",
    mode: "numerical",
    categories: [
      { key: "composition-size", name: "Composition & Size of Nucleus", count: 5 },
      { key: "nuclear-force", name: "Nuclear Force", count: 3 },
      { key: "mass-defect", name: "Mass–Energy Relation & Mass Defect", count: 7 },
      { key: "binding-energy", name: "Binding Energy per Nucleon", count: 7 },
      { key: "fission", name: "Nuclear Fission", count: 4 },
      { key: "fusion", name: "Nuclear Fusion", count: 4 },
    ],
  },
  {
    chapterId: "cbse-physics-ch14",
    mode: "mixed",
    categories: [
      { key: "energy-bands", name: "Energy Bands in Conductors, Semiconductors & Insulators", count: 5 },
      { key: "intrinsic-extrinsic", name: "Intrinsic & Extrinsic Semiconductors (p & n type)", count: 6 },
      { key: "pn-junction", name: "p-n Junction", count: 6 },
      { key: "diode-characteristics", name: "Diode I–V Characteristics (Forward & Reverse Bias)", count: 7 },
      { key: "rectifier", name: "Junction Diode as a Rectifier", count: 6 },
    ],
  },
]);
