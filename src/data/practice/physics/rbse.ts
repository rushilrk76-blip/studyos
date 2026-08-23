import { defineConceptPractice } from "@/data/practice/build-concept";

/*
  RBSE (BSER Ajmer) Class 12 Physics — numerical practice structure.

  Authored SEPARATELY from CBSE. Category names follow the RBSE
  topic list already transcribed in src/data/syllabus/rbse/physics.ts,
  which follows NCERT section headings and retains several items
  CBSE has rationalised out (Motional EMF, Ampere's circuital law
  detail, Magnetism & Gauss's law, Electron emission, …).

  NO question text exists yet — these are tracking slots only.
*/
export const rbsePhysicsPractice = defineConceptPractice("rbse", "physics", [
  {
    chapterId: "rbse-physics-ch1",
    mode: "numerical",
    categories: [
      { key: "charge-properties", name: "Basic Properties & Quantisation of Charge", count: 4 },
      { key: "coulombs-law", name: "Coulomb's Law & Forces Between Multiple Charges", count: 6 },
      { key: "electric-field", name: "Electric Field due to a System of Charges", count: 5 },
      { key: "dipole", name: "Electric Dipole & Dipole in a Uniform External Field", count: 6 },
      { key: "flux-gauss", name: "Electric Flux & Gauss's Law", count: 5 },
      { key: "gauss-applications", name: "Applications of Gauss's Law", count: 4 },
    ],
  },
  {
    chapterId: "rbse-physics-ch2",
    mode: "numerical",
    categories: [
      { key: "potential", name: "Potential due to Point Charge, Dipole & System", count: 6 },
      { key: "equipotential", name: "Equipotential Surfaces & Relation Between Field and Potential", count: 4 },
      { key: "potential-energy", name: "Potential Energy of a System of Charges", count: 5 },
      { key: "external-field", name: "Potential Energy in an External Field", count: 4 },
      { key: "conductors", name: "Electrostatics of Conductors & Electrostatic Shielding", count: 3 },
      { key: "capacitors", name: "Capacitors, Parallel Plate Capacitor & Effect of Dielectric", count: 5 },
      { key: "combination-energy", name: "Combination of Capacitors & Energy Stored", count: 3 },
    ],
  },
  {
    chapterId: "rbse-physics-ch3",
    mode: "numerical",
    categories: [
      { key: "current-conductors", name: "Electric Current & Electric Currents in Conductors", count: 4 },
      { key: "ohms-law", name: "Ohm's Law & Its Limitations", count: 4 },
      { key: "drift-resistivity", name: "Drift of Electrons & Origin of Resistivity (Mobility)", count: 5 },
      { key: "resistivity-materials", name: "Resistivity of Materials & Temperature Dependence", count: 5 },
      { key: "energy-power", name: "Electrical Energy & Power", count: 4 },
      { key: "cells", name: "Cells, EMF, Internal Resistance & Combinations", count: 5 },
      { key: "kirchhoff-wheatstone", name: "Kirchhoff's Rules & Wheatstone Bridge", count: 3 },
    ],
  },
  {
    chapterId: "rbse-physics-ch4",
    mode: "numerical",
    categories: [
      { key: "lorentz-force", name: "Magnetic Force & Lorentz Force", count: 5 },
      { key: "motion-field", name: "Motion in a Magnetic Field", count: 4 },
      { key: "biot-savart", name: "Biot–Savart Law & Field on Axis of Circular Loop", count: 5 },
      { key: "amperes-circuital", name: "Ampere's Circuital Law & The Solenoid", count: 5 },
      { key: "parallel-currents", name: "Force Between Two Parallel Currents — The Ampere", count: 4 },
      { key: "torque-dipole", name: "Torque on a Current Loop & Magnetic Dipole", count: 4 },
      { key: "galvanometer", name: "The Moving Coil Galvanometer", count: 3 },
    ],
  },
  {
    chapterId: "rbse-physics-ch5",
    mode: "mixed",
    categories: [
      { key: "bar-magnet", name: "The Bar Magnet & Magnetic Field Lines", count: 5 },
      { key: "equivalent-solenoid", name: "Bar Magnet as an Equivalent Solenoid", count: 4 },
      { key: "dipole-uniform-field", name: "The Dipole in a Uniform Magnetic Field", count: 5 },
      { key: "gauss-magnetism", name: "Magnetism and Gauss's Law", count: 4 },
      { key: "magnetisation", name: "Magnetisation & Magnetic Intensity", count: 6 },
      { key: "magnetic-materials", name: "Diamagnetism, Paramagnetism & Ferromagnetism", count: 6 },
    ],
  },
  {
    chapterId: "rbse-physics-ch6",
    mode: "numerical",
    categories: [
      { key: "magnetic-flux", name: "Magnetic Flux", count: 4 },
      { key: "faradays-law", name: "Faraday's Law of Induction", count: 6 },
      { key: "lenzs-law", name: "Lenz's Law & Conservation of Energy", count: 5 },
      { key: "motional-emf", name: "Motional Electromotive Force", count: 6 },
      { key: "mutual-inductance", name: "Mutual Inductance", count: 4 },
      { key: "self-inductance", name: "Self Inductance", count: 3 },
      { key: "ac-generator", name: "AC Generator", count: 2 },
    ],
  },
  {
    chapterId: "rbse-physics-ch7",
    mode: "numerical",
    categories: [
      { key: "ac-resistor", name: "AC Voltage Applied to a Resistor", count: 4 },
      { key: "ac-inductor", name: "AC Voltage Applied to an Inductor", count: 4 },
      { key: "ac-capacitor", name: "AC Voltage Applied to a Capacitor", count: 4 },
      { key: "lcr-phasor", name: "Series LCR Circuit & Phasor Diagram Solution", count: 6 },
      { key: "resonance", name: "Resonance", count: 5 },
      { key: "power-factor", name: "Power in AC Circuit & The Power Factor", count: 4 },
      { key: "transformers", name: "Transformers", count: 3 },
    ],
  },
  {
    chapterId: "rbse-physics-ch8",
    mode: "mixed",
    categories: [
      { key: "displacement-current", name: "Displacement Current", count: 7 },
      { key: "sources", name: "Sources of Electromagnetic Waves", count: 5 },
      { key: "nature", name: "Nature of Electromagnetic Waves", count: 7 },
      { key: "spectrum", name: "Electromagnetic Spectrum", count: 7 },
      { key: "spectrum-uses", name: "Uses of Spectrum Regions", count: 4 },
    ],
  },
  {
    chapterId: "rbse-physics-ch9",
    mode: "numerical",
    categories: [
      { key: "mirrors", name: "Reflection by Spherical Mirrors & The Mirror Equation", count: 5 },
      { key: "refraction-tir", name: "Refraction & Total Internal Reflection", count: 5 },
      { key: "spherical-surface", name: "Refraction at a Spherical Surface", count: 4 },
      { key: "lens-maker", name: "Refraction by a Lens & Lens Maker's Formula", count: 5 },
      { key: "power-combination", name: "Power of a Lens & Combination of Thin Lenses", count: 4 },
      { key: "prism", name: "Refraction Through a Prism", count: 4 },
      { key: "instruments", name: "The Microscope & The Telescope", count: 3 },
    ],
  },
  {
    chapterId: "rbse-physics-ch10",
    mode: "numerical",
    categories: [
      { key: "huygens", name: "Huygens Principle", count: 5 },
      { key: "plane-waves", name: "Refraction & Reflection of Plane Waves", count: 5 },
      { key: "coherent-addition", name: "Coherent & Incoherent Addition of Waves", count: 5 },
      { key: "youngs-experiment", name: "Interference of Light Waves & Young's Experiment", count: 8 },
      { key: "diffraction", name: "Diffraction — The Single Slit", count: 4 },
      { key: "central-maximum", name: "Width of the Central Maximum", count: 3 },
    ],
  },
  {
    chapterId: "rbse-physics-ch11",
    mode: "numerical",
    categories: [
      { key: "electron-emission", name: "Electron Emission", count: 4 },
      { key: "photoelectric-observations", name: "Photoelectric Effect: Hertz, Hallwachs & Lenard", count: 5 },
      { key: "experimental-study", name: "Effect of Intensity, Potential & Frequency", count: 6 },
      { key: "einstein-equation", name: "Einstein's Photoelectric Equation", count: 6 },
      { key: "photon", name: "Particle Nature of Light — The Photon", count: 5 },
      { key: "de-broglie", name: "Wave Nature of Matter & de Broglie Relation", count: 4 },
    ],
  },
  {
    chapterId: "rbse-physics-ch12",
    mode: "numerical",
    categories: [
      { key: "alpha-scattering", name: "Alpha-Particle Scattering & Rutherford's Nuclear Model", count: 6 },
      { key: "alpha-trajectory", name: "Alpha-Particle Trajectory", count: 4 },
      { key: "electron-orbits", name: "Electron Orbits", count: 5 },
      { key: "spectral-series", name: "Atomic Spectra & Spectral Series", count: 5 },
      { key: "bohr-energy-levels", name: "Bohr Model & Energy Levels", count: 6 },
      { key: "hydrogen-line-spectra", name: "The Line Spectra of the Hydrogen Atom", count: 4 },
    ],
  },
  {
    chapterId: "rbse-physics-ch13",
    mode: "numerical",
    categories: [
      { key: "atomic-masses", name: "Atomic Masses & Composition of Nucleus", count: 5 },
      { key: "nucleus-size", name: "Size of the Nucleus", count: 4 },
      { key: "mass-energy", name: "Mass–Energy Relation", count: 5 },
      { key: "binding-energy", name: "Nuclear Binding Energy", count: 7 },
      { key: "nuclear-force", name: "Nuclear Force", count: 3 },
      { key: "fission-fusion", name: "Nuclear Energy — Fission & Fusion", count: 6 },
    ],
  },
  {
    chapterId: "rbse-physics-ch14",
    mode: "mixed",
    categories: [
      { key: "classification", name: "Classification of Metals, Conductors & Semiconductors", count: 5 },
      { key: "intrinsic", name: "Intrinsic Semiconductor", count: 5 },
      { key: "extrinsic", name: "Extrinsic Semiconductor — n-type & p-type", count: 6 },
      { key: "pn-junction", name: "p-n Junction Formation", count: 5 },
      { key: "diode-bias", name: "Diode Under Forward & Reverse Bias", count: 6 },
      { key: "rectifier", name: "Application of Junction Diode as a Rectifier", count: 3 },
    ],
  },
]);
