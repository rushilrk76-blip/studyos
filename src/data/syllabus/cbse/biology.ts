import { defineSubject } from "@/data/syllabus/build";

/*
  CBSE Class XII Biology (Subject Code 044) — Curriculum 2025-26.
  Source: cbseacademic.nic.in official curriculum PDF
  "Biology_SrSec_2025-26.pdf", CLASS XII (2025-26) theory syllabus
  (Units VI–X, Chapters 1–13).
*/
export const cbseBiology = defineSubject("cbse", "biology", [
  {
    title: "Sexual Reproduction in Flowering Plants",
    unit: "Unit VI: Reproduction",
    topics: [
      "Flower structure",
      "Development of male and female gametophytes",
      "Pollination — types, agencies and examples",
      "Outbreeding devices",
      "Pollen-pistil interaction",
      "Double fertilisation",
      "Post fertilisation events — development of endosperm and embryo",
      "Development of seed and formation of fruit",
      "Special modes — apomixis, parthenocarpy, polyembryony",
      "Significance of seed dispersal and fruit formation",
    ],
  },
  {
    title: "Human Reproduction",
    unit: "Unit VI: Reproduction",
    topics: [
      "Male and female reproductive systems",
      "Microscopic anatomy of testis and ovary",
      "Gametogenesis — spermatogenesis and oogenesis",
      "Menstrual cycle",
      "Fertilisation",
      "Embryo development upto blastocyst formation",
      "Implantation",
      "Pregnancy and placenta formation (elementary idea)",
      "Parturition (elementary idea)",
      "Lactation (elementary idea)",
    ],
  },
  {
    title: "Reproductive Health",
    unit: "Unit VI: Reproduction",
    topics: [
      "Need for reproductive health",
      "Prevention of Sexually Transmitted Diseases (STDs)",
      "Birth control — need and methods",
      "Contraception and medical termination of pregnancy (MTP)",
      "Amniocentesis",
      "Infertility and assisted reproductive technologies — IVF, ZIFT, GIFT (elementary idea)",
    ],
  },
  {
    title: "Principles of Inheritance and Variation",
    unit: "Unit VII: Genetics and Evolution",
    topics: [
      "Heredity and variation: Mendelian inheritance",
      "Deviations from Mendelism — incomplete dominance",
      "Deviations from Mendelism — co-dominance",
      "Multiple alleles and inheritance of blood groups",
      "Pleiotropy",
      "Elementary idea of polygenic inheritance",
      "Chromosome theory of inheritance",
      "Chromosomes and genes",
      "Sex determination — in humans, birds and honey bee",
      "Linkage and crossing over",
      "Sex linked inheritance — haemophilia, colour blindness",
      "Mendelian disorders in humans — thalassemia",
      "Chromosomal disorders in humans — Down's syndrome, Turner's and Klinefelter's syndromes",
    ],
  },
  {
    title: "Molecular Basis of Inheritance",
    unit: "Unit VII: Genetics and Evolution",
    topics: [
      "Search for genetic material and DNA as genetic material",
      "Structure of DNA and RNA",
      "DNA packaging",
      "DNA replication",
      "Central dogma",
      "Transcription",
      "Genetic code",
      "Translation",
      "Gene expression and regulation — lac operon",
      "Genome, human and rice genome projects",
      "DNA fingerprinting",
    ],
  },
  {
    title: "Evolution",
    unit: "Unit VII: Genetics and Evolution",
    topics: [
      "Origin of life",
      "Biological evolution and evidences for biological evolution (paleontology, comparative anatomy, embryology and molecular evidences)",
      "Darwin's contribution and modern synthetic theory of evolution",
      "Mechanism of evolution — variation (mutation and recombination)",
      "Natural selection with examples, types of natural selection",
      "Gene flow and genetic drift",
      "Hardy-Weinberg's principle",
      "Adaptive radiation",
      "Human evolution",
    ],
  },
  {
    title: "Human Health and Diseases",
    unit: "Unit VIII: Biology and Human Welfare",
    topics: [
      "Pathogens and parasites causing human diseases (malaria, dengue, chikungunya, filariasis, ascariasis, typhoid, pneumonia, common cold, amoebiasis, ring worm) and their control",
      "Basic concepts of immunology — vaccines",
      "Cancer",
      "HIV and AIDS",
      "Adolescence — drug and alcohol abuse",
    ],
  },
  {
    title: "Microbes in Human Welfare",
    unit: "Unit VIII: Biology and Human Welfare",
    topics: [
      "Microbes in food processing",
      "Microbes in industrial production",
      "Microbes in sewage treatment",
      "Microbes in energy generation",
      "Microbes as bio-control agents and bio-fertilisers",
      "Antibiotics: production and judicious use",
    ],
  },
  {
    title: "Biotechnology — Principles and Processes",
    unit: "Unit IX: Biotechnology and its Applications",
    topics: ["Genetic engineering (Recombinant DNA Technology)"],
  },
  {
    title: "Biotechnology and its Applications",
    unit: "Unit IX: Biotechnology and its Applications",
    topics: [
      "Application of biotechnology in health — human insulin and vaccine production",
      "Stem cell technology",
      "Gene therapy",
      "Genetically modified organisms — Bt crops",
      "Transgenic animals",
      "Biosafety issues, biopiracy and patents",
    ],
  },
  {
    title: "Organisms and Populations",
    unit: "Unit X: Ecology and Environment",
    topics: [
      "Population interactions — mutualism, competition, predation, parasitism",
      "Population attributes — growth",
      "Population attributes — birth rate and death rate",
      "Population attributes — age distribution",
    ],
  },
  {
    title: "Ecosystem",
    unit: "Unit X: Ecology and Environment",
    topics: [
      "Ecosystems: patterns and components",
      "Productivity and decomposition",
      "Energy flow",
      "Pyramids of number, biomass and energy",
    ],
  },
  {
    title: "Biodiversity and its Conservation",
    unit: "Unit X: Ecology and Environment",
    topics: [
      "Biodiversity — concept, patterns, importance",
      "Loss of biodiversity",
      "Biodiversity conservation",
      "Hotspots, endangered organisms, extinction",
      "Red Data Book",
      "Sacred Groves, biosphere reserves, national parks, wildlife sanctuaries and Ramsar sites",
    ],
  },
]);
