import { defineConceptPractice } from "@/data/practice/build-concept";

/*
  RBSE (BSER Ajmer) Class 12 Chemistry — practice structure.

  Authored SEPARATELY from CBSE. Category names follow the RBSE
  topic list in src/data/syllabus/rbse/chemistry.ts, which keeps
  NCERT section headings and includes items such as Reverse
  Osmosis, Primary/Secondary Batteries and Collision Theory.

  Same academic rule as CBSE: only genuinely calculation-heavy
  units (Solutions, Electrochemistry, Chemical Kinetics) are
  organised by formulas. Coordination Compounds is "mixed".
  Organic & inorganic units use concept-based practice — no
  invented formulas.

  NO question text exists yet — these are tracking slots only.
*/
export const rbseChemistryPractice = defineConceptPractice("rbse", "chemistry", [
  {
    chapterId: "rbse-chemistry-ch1",
    mode: "numerical",
    categories: [
      { key: "types-concentration", name: "Types of Solutions & Expressing Concentration", count: 5 },
      { key: "solubility-henry", name: "Solubility of Solids & Gases; Henry's Law", count: 5 },
      { key: "raoults-law", name: "Raoult's Law & Vapour Pressure of Liquid Solutions", count: 5 },
      { key: "ideal-nonideal", name: "Ideal & Non-ideal Solutions", count: 3 },
      { key: "colligative", name: "Colligative Properties: RLVP, Elevation & Depression", count: 6 },
      { key: "osmosis", name: "Osmosis, Osmotic Pressure & Reverse Osmosis", count: 4 },
      { key: "vant-hoff", name: "Abnormal Molar Masses & Van't Hoff Factor", count: 2 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch2",
    mode: "numerical",
    categories: [
      { key: "galvanic", name: "Galvanic Cells & Measurement of Electrode Potential", count: 5 },
      { key: "nernst", name: "Nernst Equation & Equilibrium Constant", count: 6 },
      { key: "gibbs", name: "Electrochemical Cell & Gibbs Energy of the Reaction", count: 4 },
      { key: "conductance", name: "Conductance & Measurement of Conductivity", count: 5 },
      { key: "molar-conductivity", name: "Molar Conductivity & Kohlrausch's Law", count: 5 },
      { key: "electrolysis", name: "Electrolysis & Laws of Electrolysis", count: 3 },
      { key: "batteries", name: "Batteries, Fuel Cells & Corrosion", count: 2 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch3",
    mode: "numerical",
    categories: [
      { key: "rate", name: "Rate of a Chemical Reaction", count: 5 },
      { key: "rate-expression", name: "Dependence of Rate on Concentration; Rate Expression", count: 5 },
      { key: "order-molecularity", name: "Order & Molecularity of a Reaction", count: 5 },
      { key: "integrated-rate", name: "Integrated Rate Equations: Zero & First Order", count: 6 },
      { key: "half-life", name: "Half-Life of a Reaction", count: 4 },
      { key: "arrhenius", name: "Arrhenius Equation & Temperature Dependence", count: 3 },
      { key: "collision-catalyst", name: "Collision Theory & Effect of Catalyst", count: 2 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch4",
    mode: "concept",
    categories: [
      { key: "position-configuration", name: "Position in Periodic Table & Electronic Configuration", count: 4 },
      { key: "sizes-enthalpies", name: "Atomic/Ionic Sizes & Ionisation Enthalpies", count: 5 },
      { key: "oxidation-potentials", name: "Oxidation States & Electrode Potential Trends", count: 5 },
      { key: "properties", name: "Magnetic Properties, Coloured Ions & Catalytic Properties", count: 5 },
      { key: "compounds", name: "Potassium Dichromate & Potassium Permanganate", count: 5 },
      { key: "lanthanoids-actinoids", name: "Lanthanoids, Lanthanoid Contraction & Actinoids", count: 6 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch5",
    mode: "mixed",
    categories: [
      { key: "werner-terms", name: "Werner's Theory & Important Terms", count: 5 },
      { key: "nomenclature", name: "Formulas & IUPAC Nomenclature", count: 6 },
      { key: "isomerism", name: "Isomerism: Geometric, Optical & Structural", count: 6 },
      { key: "vbt", name: "Valence Bond Theory", count: 4 },
      { key: "cft", name: "Crystal Field Theory", count: 5 },
      { key: "carbonyls", name: "Metal Carbonyls, Importance & Applications", count: 4 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch6",
    mode: "concept",
    categories: [
      { key: "classification", name: "Classification & Nomenclature", count: 4 },
      { key: "cx-bond", name: "Nature of C–X Bond", count: 4 },
      { key: "preparation", name: "Methods of Preparation", count: 6 },
      { key: "properties-substitution", name: "Physical Properties & Substitution Reactions", count: 6 },
      { key: "optical-rotation", name: "Optical Rotation & Stereochemistry", count: 4 },
      { key: "polyhalogen", name: "Polyhalogen Compounds (DDT, Freons, Iodoform)", count: 6 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch7",
    mode: "concept",
    categories: [
      { key: "classification", name: "Classification, Nomenclature & Structure", count: 5 },
      { key: "preparation", name: "Preparation of Alcohols & Phenols", count: 5 },
      { key: "properties-acidity", name: "Physical Properties & Acidity", count: 6 },
      { key: "reactions-dehydration", name: "Chemical Reactions & Mechanism of Dehydration", count: 5 },
      { key: "electrophilic", name: "Electrophilic Substitution Reactions of Phenols", count: 4 },
      { key: "ethers", name: "Ethers: Preparation, Properties & Reactions", count: 5 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch8",
    mode: "concept",
    categories: [
      { key: "nomenclature", name: "Nomenclature & Structure of the Carbonyl Group", count: 4 },
      { key: "preparation", name: "Preparation of Aldehydes & Ketones", count: 5 },
      { key: "nucleophilic-addition", name: "Mechanism of Nucleophilic Addition", count: 5 },
      { key: "alpha-hydrogen", name: "Reactivity of Alpha Hydrogen & Uses", count: 4 },
      { key: "carboxylic", name: "Carboxylic Acids: Preparation & Properties", count: 6 },
      { key: "acidity", name: "Acidic Nature of Carboxylic Acids", count: 6 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch9",
    mode: "concept",
    categories: [
      { key: "structure-classification", name: "Structure, Classification & Nomenclature", count: 5 },
      { key: "preparation", name: "Preparation of Amines", count: 5 },
      { key: "properties", name: "Physical & Chemical Properties", count: 5 },
      { key: "basicity", name: "Basic Character of Amines", count: 5 },
      { key: "identification", name: "Identification of Primary, Secondary & Tertiary Amines", count: 4 },
      { key: "diazonium", name: "Diazonium Salts & Their Reactions", count: 6 },
    ],
  },
  {
    chapterId: "rbse-chemistry-ch10",
    mode: "concept",
    categories: [
      { key: "carbohydrates", name: "Classification of Carbohydrates", count: 4 },
      { key: "monosaccharides", name: "Glucose & Fructose: Preparation & Structure", count: 5 },
      { key: "polysaccharides", name: "Disaccharides & Polysaccharides", count: 5 },
      { key: "proteins", name: "Amino Acids & Structure of Proteins", count: 6 },
      { key: "denaturation-enzymes", name: "Denaturation of Proteins & Enzymes", count: 4 },
      { key: "vitamins-nucleic", name: "Vitamins, Hormones & Nucleic Acids", count: 6 },
    ],
  },
]);
