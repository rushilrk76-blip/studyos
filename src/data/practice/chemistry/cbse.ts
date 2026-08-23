import { defineConceptPractice } from "@/data/practice/build-concept";

/*
  CBSE Class XII Chemistry — practice structure.

  IMPORTANT ACADEMIC NOTE:
  Chemistry is not numerical in every chapter. Only the genuinely
  calculation-heavy units are organised by FORMULAS:

    Unit 1 Solutions, Unit 2 Electrochemistry, Unit 3 Chemical Kinetics

  Unit 5 Coordination Compounds is "mixed" (some magnetic-moment /
  CFT calculation, largely conceptual).

  The remaining organic & inorganic units are "concept" mode:
  they get 30 general Practice Questions grouped by the chapter's
  own official topics. We deliberately do NOT invent formulas for
  chapters that don't have them.

  Category names come from src/data/syllabus/cbse/chemistry.ts.
  NO question text exists yet — these are tracking slots only.
*/
export const cbseChemistryPractice = defineConceptPractice("cbse", "chemistry", [
  {
    chapterId: "cbse-chemistry-ch1",
    mode: "numerical",
    categories: [
      { key: "concentration", name: "Concentration Terms (Molarity, Molality, Mole Fraction)", count: 6 },
      { key: "henrys-law", name: "Solubility of Gases in Liquids & Henry's Law", count: 4 },
      { key: "raoults-law", name: "Raoult's Law & Vapour Pressure", count: 6 },
      { key: "rlvp", name: "Relative Lowering of Vapour Pressure", count: 4 },
      { key: "bp-fp", name: "Elevation of Boiling Point & Depression of Freezing Point", count: 5 },
      { key: "osmotic-pressure", name: "Osmotic Pressure & Determination of Molecular Masses", count: 3 },
      { key: "vant-hoff", name: "Abnormal Molecular Mass & Van't Hoff Factor", count: 2 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch2",
    mode: "numerical",
    categories: [
      { key: "emf-electrode", name: "EMF of a Cell & Standard Electrode Potential", count: 5 },
      { key: "nernst", name: "Nernst Equation & Its Applications", count: 6 },
      { key: "gibbs-emf", name: "Gibbs Energy Change & EMF of a Cell", count: 4 },
      { key: "conductivity", name: "Conductance, Specific & Molar Conductivity", count: 6 },
      { key: "kohlrausch", name: "Kohlrausch's Law", count: 4 },
      { key: "electrolysis", name: "Electrolysis & Laws of Electrolysis", count: 5 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch3",
    mode: "numerical",
    categories: [
      { key: "rate", name: "Rate of a Reaction (Average & Instantaneous)", count: 5 },
      { key: "order-molecularity", name: "Order & Molecularity of a Reaction", count: 5 },
      { key: "rate-law", name: "Rate Law & Specific Rate Constant", count: 5 },
      { key: "integrated-rate", name: "Integrated Rate Equations (Zero & First Order)", count: 6 },
      { key: "half-life", name: "Half-Life Calculations", count: 5 },
      { key: "arrhenius", name: "Arrhenius Equation & Activation Energy", count: 4 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch4",
    mode: "concept",
    categories: [
      { key: "configuration", name: "Electronic Configuration, Occurrence & Characteristics", count: 5 },
      { key: "trends", name: "Metallic Character & Ionisation Enthalpy Trends", count: 5 },
      { key: "oxidation-states", name: "Oxidation States, Ionic Radii & Colour", count: 5 },
      { key: "properties", name: "Magnetic, Catalytic Properties & Interstitial Compounds", count: 5 },
      { key: "compounds", name: "Preparation & Properties of K2Cr2O7 and KMnO4", count: 5 },
      { key: "lanthanides-actinides", name: "Lanthanides, Lanthanide Contraction & Actinides", count: 5 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch5",
    mode: "mixed",
    categories: [
      { key: "terms", name: "Ligands, Coordination Number, Colour & Shapes", count: 5 },
      { key: "nomenclature", name: "IUPAC Nomenclature of Mononuclear Complexes", count: 6 },
      { key: "werner", name: "Werner's Theory", count: 4 },
      { key: "vbt", name: "Valence Bond Theory (VBT)", count: 5 },
      { key: "cft", name: "Crystal Field Theory (CFT)", count: 5 },
      { key: "isomerism", name: "Structure, Stereoisomerism & Importance", count: 5 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch6",
    mode: "concept",
    categories: [
      { key: "nomenclature", name: "Nomenclature & Nature of C–X Bond", count: 5 },
      { key: "preparation", name: "Methods of Preparation", count: 5 },
      { key: "properties", name: "Physical & Chemical Properties", count: 5 },
      { key: "substitution", name: "Mechanism of Substitution Reactions", count: 6 },
      { key: "optical-rotation", name: "Optical Rotation & Stereochemistry", count: 4 },
      { key: "uses", name: "Uses & Environmental Effects (DDT, Freons, Iodoform)", count: 5 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch7",
    mode: "concept",
    categories: [
      { key: "nomenclature", name: "Nomenclature & Classification", count: 4 },
      { key: "preparation", name: "Preparation of Alcohols & Phenols", count: 6 },
      { key: "properties", name: "Properties & Identification of Alcohols", count: 5 },
      { key: "phenol-acidity", name: "Acidic Nature of Phenol & Electrophilic Substitution", count: 6 },
      { key: "dehydration", name: "Mechanism of Dehydration", count: 4 },
      { key: "ethers", name: "Ethers: Preparation, Properties & Uses", count: 5 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch8",
    mode: "concept",
    categories: [
      { key: "nomenclature", name: "Nomenclature & Nature of Carbonyl Group", count: 4 },
      { key: "preparation", name: "Preparation of Aldehydes & Ketones", count: 5 },
      { key: "nucleophilic-addition", name: "Mechanism of Nucleophilic Addition", count: 5 },
      { key: "alpha-hydrogen", name: "Reactivity of Alpha Hydrogen & Named Reactions", count: 5 },
      { key: "carboxylic-preparation", name: "Carboxylic Acids: Preparation & Properties", count: 6 },
      { key: "acidity", name: "Acidic Nature of Carboxylic Acids", count: 5 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch9",
    mode: "concept",
    categories: [
      { key: "classification", name: "Nomenclature, Classification & Structure", count: 5 },
      { key: "preparation", name: "Methods of Preparation", count: 6 },
      { key: "properties", name: "Physical & Chemical Properties", count: 5 },
      { key: "basicity", name: "Basic Character of Amines", count: 5 },
      { key: "identification", name: "Identification of Primary, Secondary & Tertiary Amines", count: 4 },
      { key: "diazonium", name: "Diazonium Salts: Preparation & Reactions", count: 5 },
    ],
  },
  {
    chapterId: "cbse-chemistry-ch10",
    mode: "concept",
    categories: [
      { key: "carbohydrates", name: "Classification of Carbohydrates", count: 5 },
      { key: "monosaccharides", name: "Monosaccharides: Glucose & Fructose", count: 5 },
      { key: "polysaccharides", name: "Oligosaccharides & Polysaccharides", count: 5 },
      { key: "amino-acids", name: "Proteins, Amino Acids & Peptide Bond", count: 5 },
      { key: "protein-structure", name: "Structure & Denaturation of Proteins; Enzymes", count: 5 },
      { key: "vitamins-nucleic", name: "Vitamins, Hormones & Nucleic Acids", count: 5 },
    ],
  },
]);
