import React, { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════
// SPECIALTY DATA — evidence-grounded, fully local scoring
// Sources: ACGME Milestones 2.0 (2024), CanMEDS 2015 (Frank JR et al.
// Royal College of Physicians and Surgeons of Canada),
// Charalampous K et al. PMC 2024 PMCID PMC12409705,
// Shehab M et al. PMC 2024 PMCID PMC11534378,
// FDA AI/ML SaMD database 2024.
// aiR = AI replaceability 0-10. mkt = market demand 0-10.
// Last reviewed: March 2026
// ══════════════════════════════════════════════════════════════════

const SD = {
  "Diagnostic Radiology":{ t:"critical", n:"76% of 700 FDA-cleared AI algorithms (2024) are in diagnostic radiology. AI matches radiologists on chest X-ray triage, nodule detection, and fracture identification.",
    s:[
      { name:"Diagnostic image interpretation & pattern recognition",  aiR:8, mkt:8 },
      { name:"Interventional radiology procedures",                    aiR:2, mkt:9 },
      { name:"Clinical consultation & structured reporting",           aiR:5, mkt:7 },
      { name:"Image-guided procedural guidance",                       aiR:2, mkt:9 },
      { name:"Radiation safety & dose optimization",                   aiR:4, mkt:7 },
      { name:"AI output oversight & quality assurance",                aiR:1, mkt:9 },
      { name:"Diagnostic reasoning under uncertainty",                 aiR:3, mkt:9 }
    ]},
  "Pathology":{ t:"critical", n:"Deep learning models match pathologists on histologic grading of prostate, breast, and colorectal cancer. Whole-slide image analysis is FDA-cleared.",
    s:[
      { name:"Histopathological pattern recognition & diagnosis",      aiR:8, mkt:8 },
      { name:"Molecular & genomic data interpretation",                aiR:5, mkt:9 },
      { name:"Intraoperative consultation (frozen section)",           aiR:2, mkt:8 },
      { name:"Laboratory oversight & quality assurance",               aiR:3, mkt:7 },
      { name:"Clinical correlation & diagnostic synthesis",            aiR:3, mkt:8 },
      { name:"Interdisciplinary communication",                        aiR:1, mkt:8 },
      { name:"AI-assisted slide review oversight",                     aiR:1, mkt:9 }
    ]},
  "Neuroradiology":{ t:"critical", n:"Neuroradiology has the highest AI algorithm penetration of any subspecialty. FDA-cleared AI stroke triage and intracranial hemorrhage detection tools are in emergency deployment.",
    s:[
      { name:"Neuroimaging interpretation (MRI, CT, angiography)",     aiR:7, mkt:8 },
      { name:"Stroke imaging triage & protocol",                       aiR:6, mkt:9 },
      { name:"Interventional neuroradiology procedures",               aiR:2, mkt:9 },
      { name:"Advanced & functional neuroimaging",                     aiR:4, mkt:8 },
      { name:"AI triage tool oversight & validation",                  aiR:1, mkt:9 },
      { name:"Clinical correlation with neurology & neurosurgery",     aiR:2, mkt:8 },
      { name:"Pediatric & developmental neuroimaging",                 aiR:4, mkt:7 }
    ]},
  "Dermatology":{ t:"high", n:"AI classifies melanoma and skin lesions at dermatologist-level accuracy in controlled studies. Complex inflammatory disease, procedural skills, and whole-patient care remain defensible.",
    s:[
      { name:"Clinical & dermoscopic skin examination",                aiR:6, mkt:8 },
      { name:"Dermatologic procedures (biopsy, excision, Mohs)",       aiR:2, mkt:9 },
      { name:"Complex inflammatory disease management",                aiR:2, mkt:8 },
      { name:"Rare disease recognition & diagnosis",                   aiR:3, mkt:7 },
      { name:"Surgical & cosmetic procedural skills",                  aiR:1, mkt:9 },
      { name:"Patient counseling & therapeutic relationship",          aiR:1, mkt:8 },
      { name:"Whole-patient dermatologic care",                        aiR:2, mkt:8 }
    ]},
  "Ophthalmology":{ t:"high", n:"AI detects diabetic retinopathy and macular degeneration at specialist-level accuracy. FDA-cleared autonomous AI diagnostic systems are deployed.",
    s:[
      { name:"Retinal imaging interpretation",                         aiR:7, mkt:8 },
      { name:"Cataract & anterior segment surgery",                    aiR:1, mkt:9 },
      { name:"Glaucoma diagnosis & surgical management",               aiR:4, mkt:8 },
      { name:"Retinal surgery & laser procedures",                     aiR:2, mkt:9 },
      { name:"Neuro-ophthalmology clinical assessment",                aiR:2, mkt:7 },
      { name:"AI diagnostic output oversight",                         aiR:1, mkt:9 },
      { name:"Patient counseling for vision-threatening conditions",   aiR:1, mkt:8 }
    ]},
  "Radiation Oncology":{ t:"high", n:"AI automates treatment planning, dose optimization, and target delineation. Clinical judgment in adaptive radiotherapy and toxicity management remain defensible.",
    s:[
      { name:"Treatment planning & dose prescription",                 aiR:6, mkt:8 },
      { name:"Tumor target delineation & contouring",                  aiR:6, mkt:8 },
      { name:"Stereotactic & radiosurgery techniques",                 aiR:3, mkt:9 },
      { name:"Patient counseling through radiation therapy",           aiR:1, mkt:8 },
      { name:"Radiation biology & physics mastery",                    aiR:2, mkt:7 },
      { name:"Toxicity assessment & management",                       aiR:2, mkt:8 },
      { name:"AI-assisted contouring oversight",                       aiR:1, mkt:9 }
    ]},
  "Nuclear Medicine":{ t:"high", n:"AI interprets PET/SPECT imaging with growing accuracy. Theranostics requires nuanced clinical judgment. Radiopharmaceutical selection and dosimetry remain defensible.",
    s:[
      { name:"Nuclear imaging interpretation (PET/SPECT)",             aiR:6, mkt:8 },
      { name:"Radiopharmaceutical therapy (theranostics)",             aiR:2, mkt:9 },
      { name:"Hybrid imaging protocol design",                         aiR:3, mkt:8 },
      { name:"Radiation safety & dosimetry",                           aiR:3, mkt:7 },
      { name:"Molecular imaging clinical correlation",                 aiR:3, mkt:8 },
      { name:"Clinical reporting & communication",                     aiR:4, mkt:7 },
      { name:"Quality assurance & regulatory compliance",              aiR:3, mkt:7 }
    ]},
  "Interventional Radiology":{ t:"high", n:"AI assists with procedure planning and vessel segmentation. Procedural skill, real-time intraoperative judgment, and complication management remain deeply human-dependent.",
    s:[
      { name:"Vascular & non-vascular interventional procedures",      aiR:2, mkt:9 },
      { name:"Image-guided tumor ablation",                            aiR:2, mkt:9 },
      { name:"Procedure planning & vascular anatomy",                  aiR:4, mkt:8 },
      { name:"Complication recognition & management",                  aiR:1, mkt:9 },
      { name:"Patient consent & periprocedural care",                  aiR:1, mkt:8 },
      { name:"Fluoroscopic & ultrasound-guided navigation",            aiR:3, mkt:8 },
      { name:"Multidisciplinary team integration",                     aiR:1, mkt:8 }
    ]},
  "Cardiology":{ t:"high", n:"AI-ECG interpretation, echocardiography analysis, and coronary artery disease detection are FDA-cleared and widely deployed. Interventional procedures and patient relationships remain defensible.",
    s:[
      { name:"Echocardiography & cardiac imaging interpretation",      aiR:6, mkt:8 },
      { name:"Cardiac catheterization & coronary intervention",        aiR:2, mkt:9 },
      { name:"Electrophysiology & arrhythmia management",             aiR:4, mkt:9 },
      { name:"Heart failure management & advanced therapies",          aiR:2, mkt:9 },
      { name:"Acute coronary syndrome decision-making",                aiR:3, mkt:9 },
      { name:"Structural heart disease management",                    aiR:2, mkt:9 },
      { name:"AI-ECG output oversight & integration",                  aiR:1, mkt:9 }
    ]},
  "Hematology & Oncology":{ t:"high", n:"AI predicts treatment response and identifies molecular biomarkers. Complex treatment decisions, clinical trial navigation, and goals-of-care conversations require human expertise.",
    s:[
      { name:"Complex oncologic treatment planning",                   aiR:3, mkt:9 },
      { name:"Hematologic disease diagnosis & management",             aiR:3, mkt:8 },
      { name:"Clinical trial design & patient selection",              aiR:2, mkt:9 },
      { name:"Serious illness communication & goals of care",          aiR:1, mkt:9 },
      { name:"Bone marrow biopsy & procedural skills",                 aiR:1, mkt:8 },
      { name:"Molecular oncology & targeted therapy",                  aiR:4, mkt:9 },
      { name:"Multidisciplinary cancer team leadership",               aiR:1, mkt:9 }
    ]},
  "Medical Genetics & Genomics":{ t:"high", n:"AI tools interpret genomic variants with increasing accuracy. Phenotype-genotype integration, genetic counseling, and rare disease synthesis require human expertise.",
    s:[
      { name:"Genomic data interpretation & variant analysis",         aiR:6, mkt:9 },
      { name:"Genetic counseling & risk communication",                aiR:1, mkt:9 },
      { name:"Phenotype-genotype correlation",                         aiR:3, mkt:8 },
      { name:"Rare disease diagnosis & syndrome recognition",          aiR:3, mkt:8 },
      { name:"Molecular diagnostic oversight",                         aiR:4, mkt:8 },
      { name:"Hereditary cancer syndrome management",                  aiR:2, mkt:9 },
      { name:"Precision medicine & pharmacogenomics",                  aiR:4, mkt:9 }
    ]},
  "Pediatric Cardiology":{ t:"high", n:"AI assists with fetal and pediatric echocardiography interpretation. Congenital heart disease management, catheterization, and family communication remain defensible.",
    s:[
      { name:"Congenital heart disease diagnosis & management",        aiR:2, mkt:8 },
      { name:"Pediatric echocardiography interpretation",              aiR:5, mkt:8 },
      { name:"Cardiac catheterization in children",                    aiR:1, mkt:8 },
      { name:"Fetal cardiac evaluation",                               aiR:4, mkt:8 },
      { name:"Electrophysiology in pediatric patients",                aiR:3, mkt:7 },
      { name:"Family-centered cardiac care & counseling",              aiR:1, mkt:9 },
      { name:"Multidisciplinary congenital heart team collaboration",  aiR:1, mkt:8 }
    ]},
  "Internal Medicine":{ t:"moderate", n:"AI tools support clinical decision-making and documentation. Complex multi-system reasoning, longitudinal patient relationships, and integrative care remain core defensible competencies.",
    s:[
      { name:"Diagnostic reasoning across multi-system illness",       aiR:3, mkt:8 },
      { name:"Longitudinal patient relationship & continuity care",    aiR:1, mkt:8 },
      { name:"Evidence-based clinical decision-making",                aiR:4, mkt:8 },
      { name:"Procedural competency (LP, thoracentesis, paracentesis)",aiR:1, mkt:7 },
      { name:"Systems navigation & care coordination",                 aiR:2, mkt:8 },
      { name:"Clinical teaching & supervision",                        aiR:1, mkt:8 },
      { name:"Chronic disease management & shared decision-making",    aiR:3, mkt:8 }
    ]},
  "General Surgery":{ t:"moderate", n:"Robotic surgery is expanding but surgical judgment, operative decision-making, and complication management require human expertise.",
    s:[
      { name:"Open & laparoscopic surgical technique",                 aiR:2, mkt:8 },
      { name:"Perioperative patient management",                       aiR:3, mkt:8 },
      { name:"Surgical decision-making & operative judgment",          aiR:1, mkt:9 },
      { name:"Emergency surgical intervention",                        aiR:1, mkt:9 },
      { name:"Wound management & complication recognition",            aiR:2, mkt:7 },
      { name:"Robotic surgery integration & oversight",                aiR:2, mkt:9 },
      { name:"Anatomical knowledge & spatial reasoning",               aiR:1, mkt:8 }
    ]},
  "Anesthesiology":{ t:"moderate", n:"AI monitors hemodynamics and assists in dosing algorithms. Airway management, real-time crisis response, and intraoperative judgment have very low AI replaceability.",
    s:[
      { name:"Airway management (intubation, difficult airway)",       aiR:1, mkt:9 },
      { name:"Anesthetic pharmacology & dosing",                       aiR:4, mkt:8 },
      { name:"Hemodynamic monitoring & crisis management",             aiR:2, mkt:9 },
      { name:"Regional anesthesia & nerve block techniques",           aiR:1, mkt:9 },
      { name:"Perioperative pain management",                          aiR:3, mkt:8 },
      { name:"Patient safety monitoring & vigilance",                  aiR:2, mkt:9 },
      { name:"Surgical team communication & coordination",             aiR:1, mkt:8 }
    ]},
  "Emergency Medicine":{ t:"moderate", n:"AI supports triage and sepsis detection, but emergency care requires real-time multi-system decision-making, procedural skill, and team leadership under pressure.",
    s:[
      { name:"Rapid multi-system clinical assessment & triage",        aiR:3, mkt:9 },
      { name:"Emergency procedures (intubation, chest tube, central line)", aiR:1, mkt:9 },
      { name:"Resuscitation & critical care management",               aiR:1, mkt:9 },
      { name:"Team leadership in high-stakes environments",            aiR:1, mkt:9 },
      { name:"Trauma assessment & primary/secondary survey",           aiR:2, mkt:8 },
      { name:"Patient communication under time pressure",              aiR:1, mkt:8 },
      { name:"Disposition decision-making & resource allocation",      aiR:3, mkt:8 }
    ]},
  "Neurology":{ t:"moderate", n:"AI interprets EEG and neuroimaging with growing accuracy. The neurological examination, clinical localization, and longitudinal patient relationships are difficult to automate.",
    s:[
      { name:"Neurological examination & anatomical localization",     aiR:2, mkt:8 },
      { name:"Neuroimaging clinical interpretation",                   aiR:5, mkt:8 },
      { name:"EEG & neurophysiology interpretation",                   aiR:5, mkt:7 },
      { name:"Neurovascular emergency management",                     aiR:2, mkt:9 },
      { name:"Neurodegenerative disease long-term management",         aiR:2, mkt:8 },
      { name:"Procedural skills (LP, EMG/NCS)",                        aiR:1, mkt:7 },
      { name:"Patient & family communication in chronic neurological illness", aiR:1, mkt:8 }
    ]},
  "Obstetrics & Gynecology":{ t:"moderate", n:"AI assists fetal monitoring and imaging analysis. Obstetric emergencies, surgical judgment, reproductive counseling, and patient relationships are deeply defensible.",
    s:[
      { name:"Obstetric management & delivery",                        aiR:1, mkt:8 },
      { name:"Gynecologic surgical procedures (laparoscopic, open)",   aiR:2, mkt:8 },
      { name:"Prenatal care & fetal surveillance",                     aiR:3, mkt:8 },
      { name:"Reproductive counseling & shared decision-making",       aiR:1, mkt:8 },
      { name:"Emergency obstetric intervention",                       aiR:1, mkt:9 },
      { name:"Pelvic surgery & urogynecology",                         aiR:2, mkt:8 },
      { name:"Oncologic gynecology fundamentals",                      aiR:2, mkt:8 }
    ]},
  "Orthopaedic Surgery":{ t:"moderate", n:"AI assists imaging interpretation and surgical planning. Robotic-assisted arthroplasty is growing. Fracture management, surgical judgment, and operative technique remain defensible.",
    s:[
      { name:"Fracture management & surgical fixation",                aiR:2, mkt:8 },
      { name:"Arthroplasty technique (hip, knee, shoulder)",           aiR:2, mkt:9 },
      { name:"Musculoskeletal imaging interpretation",                 aiR:5, mkt:7 },
      { name:"Surgical planning & biomechanical reasoning",            aiR:3, mkt:8 },
      { name:"Sports medicine & soft tissue repair",                   aiR:2, mkt:8 },
      { name:"Spine surgery fundamentals",                             aiR:2, mkt:8 },
      { name:"Rehabilitation planning & functional restoration",       aiR:2, mkt:7 }
    ]},
  "Family Medicine":{ t:"moderate", n:"AI supports documentation and screening. Whole-person care, continuity relationships, and undifferentiated illness management are deeply human. Scope breadth is a natural defensible zone™.",
    s:[
      { name:"Continuity & longitudinal whole-person care",            aiR:1, mkt:8 },
      { name:"Preventive care & population health management",         aiR:3, mkt:8 },
      { name:"Undifferentiated illness diagnosis & management",        aiR:3, mkt:8 },
      { name:"Procedural skills (minor surgery, joint injection)",     aiR:1, mkt:7 },
      { name:"Behavioral health integration",                          aiR:2, mkt:8 },
      { name:"Patient communication & motivational interviewing",      aiR:1, mkt:8 },
      { name:"Community & family systems navigation",                  aiR:1, mkt:7 }
    ]},
  "Pulmonary & Critical Care":{ t:"moderate", n:"AI assists ventilator management and sepsis prediction. Critical care decision-making, family communication in the ICU, and complex pulmonary disease management remain defensible.",
    s:[
      { name:"Mechanical ventilation management",                      aiR:4, mkt:9 },
      { name:"Bronchoscopy & thoracic procedures",                     aiR:1, mkt:8 },
      { name:"Sepsis & multiorgan failure management",                 aiR:3, mkt:9 },
      { name:"Complex pulmonary disease diagnosis (ILD, PH)",         aiR:3, mkt:8 },
      { name:"ICU team leadership & end-of-life decision-making",     aiR:1, mkt:9 },
      { name:"Serious illness communication & goals of care",          aiR:1, mkt:9 },
      { name:"Pulmonary function test interpretation",                 aiR:4, mkt:7 }
    ]},
  "Gastroenterology":{ t:"moderate", n:"AI detects colorectal polyps at expert-level accuracy. Complex IBD management, ERCP, and patient care remain defensible.",
    s:[
      { name:"Diagnostic & therapeutic endoscopy (EGD, colonoscopy)", aiR:5, mkt:8 },
      { name:"ERCP & advanced endoscopic procedures",                  aiR:2, mkt:9 },
      { name:"Inflammatory bowel disease management",                  aiR:2, mkt:8 },
      { name:"Liver disease management & hepatology",                  aiR:3, mkt:8 },
      { name:"Gastrointestinal bleeding management",                   aiR:2, mkt:8 },
      { name:"Motility & functional GI disorder management",           aiR:3, mkt:7 },
      { name:"Endoscopic AI oversight",                                aiR:1, mkt:8 }
    ]},
  "Nephrology":{ t:"moderate", n:"AI assists with AKI prediction and dialysis optimization. Complex CKD management, transplant medicine, and patient communication about dialysis modalities remain defensible.",
    s:[
      { name:"Chronic kidney disease management",                      aiR:3, mkt:8 },
      { name:"Dialysis modality selection & management",               aiR:2, mkt:8 },
      { name:"Kidney transplant medicine",                             aiR:2, mkt:8 },
      { name:"Glomerulonephritis diagnosis & immunosuppression",       aiR:3, mkt:7 },
      { name:"Fluid, electrolyte & acid-base management",              aiR:3, mkt:8 },
      { name:"Kidney biopsy & procedural skills",                      aiR:1, mkt:7 },
      { name:"Patient communication for kidney disease progression",   aiR:1, mkt:8 }
    ]},
  "Rheumatology":{ t:"moderate", n:"AI assists with imaging interpretation. Complex autoimmune disease management, biologic therapy decisions, and patient counseling are defensible human skills.",
    s:[
      { name:"Autoimmune & inflammatory disease diagnosis",            aiR:3, mkt:8 },
      { name:"Biologic & targeted therapy management",                 aiR:2, mkt:9 },
      { name:"Musculoskeletal ultrasound & guided procedures",         aiR:2, mkt:8 },
      { name:"Connective tissue disease management",                   aiR:2, mkt:7 },
      { name:"Crystal arthropathy management",                         aiR:3, mkt:7 },
      { name:"Patient education & long-term treatment adherence",      aiR:1, mkt:8 },
      { name:"Multidisciplinary care coordination",                    aiR:1, mkt:8 }
    ]},
  "Endocrinology":{ t:"moderate", n:"AI assists continuous glucose monitoring and insulin dosing. Thyroid ultrasound AI is FDA-cleared. Complex endocrine disease and individualized patient counseling remain defensible.",
    s:[
      { name:"Diabetes management & insulin optimization",             aiR:5, mkt:9 },
      { name:"Thyroid disease diagnosis & management",                 aiR:4, mkt:8 },
      { name:"Adrenal & pituitary disease management",                 aiR:2, mkt:8 },
      { name:"Reproductive endocrinology & infertility",               aiR:2, mkt:8 },
      { name:"Metabolic bone disease",                                 aiR:2, mkt:7 },
      { name:"Thyroid & parathyroid ultrasound-guided procedures",     aiR:2, mkt:8 },
      { name:"Patient education for chronic endocrine conditions",     aiR:1, mkt:8 }
    ]},
  "Infectious Disease":{ t:"moderate", n:"AI supports antimicrobial stewardship and outbreak modeling. Complex infection diagnosis, antimicrobial selection in unusual presentations, and HIV care relationships are defensible.",
    s:[
      { name:"Complex infection diagnosis & antimicrobial selection",  aiR:4, mkt:8 },
      { name:"HIV & chronic viral infection management",               aiR:2, mkt:8 },
      { name:"Antimicrobial stewardship & pharmacokinetics",           aiR:4, mkt:8 },
      { name:"Tropical & travel medicine",                             aiR:2, mkt:7 },
      { name:"Infection prevention & control",                         aiR:3, mkt:8 },
      { name:"Immunocompromised host management",                      aiR:2, mkt:8 },
      { name:"Outbreak investigation & public health response",        aiR:2, mkt:8 }
    ]},
  "Urology":{ t:"moderate", n:"Robotic surgery (da Vinci) is standard in urology. AI assists with imaging. Surgical skill, patient counseling, and complex clinical reasoning remain essential.",
    s:[
      { name:"Minimally invasive urologic surgery (robotic, laparoscopic)", aiR:2, mkt:9 },
      { name:"Endoscopic procedures (cystoscopy, ureteroscopy)",       aiR:2, mkt:8 },
      { name:"Urologic oncology management",                           aiR:2, mkt:9 },
      { name:"Reconstructive urology",                                 aiR:2, mkt:8 },
      { name:"Stone disease management",                               aiR:3, mkt:7 },
      { name:"Male & female pelvic floor disorders",                   aiR:2, mkt:8 },
      { name:"Urologic imaging interpretation",                        aiR:5, mkt:7 }
    ]},
  "Otolaryngology":{ t:"moderate", n:"AI supports hearing assessment and laryngeal imaging analysis. Complex surgical procedures, head and neck oncology, and patient communication remain defensible.",
    s:[
      { name:"Head & neck surgical procedures",                        aiR:1, mkt:8 },
      { name:"Endoscopic sinus & skull base surgery",                  aiR:1, mkt:8 },
      { name:"Otologic procedures & hearing management",               aiR:2, mkt:8 },
      { name:"Voice & swallowing assessment",                          aiR:3, mkt:7 },
      { name:"Head & neck oncology management",                        aiR:2, mkt:8 },
      { name:"Facial plastics & reconstruction",                       aiR:1, mkt:8 },
      { name:"Vestibular & balance disorder management",               aiR:3, mkt:7 }
    ]},
  "Vascular Surgery":{ t:"moderate", n:"AI assists vascular imaging and endovascular planning. Open and endovascular surgical skill, limb salvage decision-making, and complex case management remain defensible.",
    s:[
      { name:"Open & endovascular surgical technique",                 aiR:2, mkt:9 },
      { name:"Vascular imaging interpretation (CTA, duplex ultrasound)", aiR:5, mkt:7 },
      { name:"Peripheral arterial disease management",                 aiR:2, mkt:8 },
      { name:"Aortic surgery (open & EVAR/FEVAR)",                     aiR:1, mkt:9 },
      { name:"Venous disease management",                              aiR:3, mkt:7 },
      { name:"Critical limb ischemia & limb salvage judgment",         aiR:1, mkt:9 },
      { name:"Postoperative vascular monitoring",                      aiR:2, mkt:7 }
    ]},
  "Thoracic Surgery":{ t:"moderate", n:"AI supports lung nodule detection and surgical planning. VATS and robotic thoracic procedures require precise surgical skill and intraoperative judgment.",
    s:[
      { name:"Pulmonary resection (VATS, robotic, open)",              aiR:2, mkt:9 },
      { name:"Esophageal surgery",                                     aiR:1, mkt:8 },
      { name:"Thoracic oncology management & staging",                 aiR:3, mkt:8 },
      { name:"Pleural disease management",                             aiR:2, mkt:7 },
      { name:"Mediastinal surgery",                                    aiR:1, mkt:8 },
      { name:"Perioperative thoracic critical care",                   aiR:2, mkt:8 },
      { name:"Minimally invasive thoracic technique",                  aiR:2, mkt:9 }
    ]},
  "Neurological Surgery":{ t:"moderate", n:"AI assists neurosurgical planning and intraoperative navigation. Cranial and spinal surgical technique and intraoperative decision-making are highly defensible.",
    s:[
      { name:"Cranial surgical technique",                             aiR:1, mkt:9 },
      { name:"Spinal surgery technique",                               aiR:1, mkt:9 },
      { name:"Intraoperative neurophysiological monitoring",           aiR:2, mkt:8 },
      { name:"Stereotactic & minimally invasive procedures",           aiR:2, mkt:9 },
      { name:"Neurocritical care management",                          aiR:2, mkt:8 },
      { name:"Complex neurosurgical decision-making",                  aiR:1, mkt:9 },
      { name:"Patient & family counseling for high-stakes interventions", aiR:1, mkt:8 }
    ]},
  "Neonatal-Perinatal Medicine":{ t:"moderate", n:"AI assists NICU monitoring and ventilator management. Neonatal resuscitation, complex prematurity management, and family communication remain defensible.",
    s:[
      { name:"Neonatal resuscitation (NRP)",                           aiR:1, mkt:9 },
      { name:"Mechanical ventilation in premature infants",            aiR:3, mkt:8 },
      { name:"Neonatal sepsis recognition & management",               aiR:3, mkt:8 },
      { name:"Extremely premature infant care",                        aiR:1, mkt:9 },
      { name:"Parent counseling & NICU family support",                aiR:1, mkt:9 },
      { name:"Neonatal transport & stabilization",                     aiR:1, mkt:8 },
      { name:"Neonatal neurology & brain injury management",           aiR:2, mkt:8 }
    ]},
  "Sleep Medicine":{ t:"moderate", n:"AI analyzes polysomnography data with growing accuracy. Complex sleep disorder diagnosis, treatment adherence counseling, and comorbid condition management require human expertise.",
    s:[
      { name:"Polysomnography interpretation",                         aiR:6, mkt:7 },
      { name:"CPAP & PAP therapy management & optimization",           aiR:3, mkt:7 },
      { name:"Complex sleep disorder diagnosis",                       aiR:3, mkt:7 },
      { name:"Behavioral insomnia treatment (CBT-I)",                  aiR:1, mkt:8 },
      { name:"Sleep in neurological & psychiatric comorbidity",        aiR:2, mkt:7 },
      { name:"Pediatric sleep medicine",                               aiR:2, mkt:7 },
      { name:"Circadian rhythm disorder management",                   aiR:2, mkt:7 }
    ]},
  "Preventive Medicine":{ t:"moderate", n:"AI supports population health analytics and disease surveillance. Health policy advocacy, community engagement, and behavioral change counseling require human expertise.",
    s:[
      { name:"Epidemiological analysis & population health",           aiR:4, mkt:8 },
      { name:"Health policy advocacy & systems change",                aiR:1, mkt:8 },
      { name:"Occupational & environmental health assessment",         aiR:3, mkt:7 },
      { name:"Biostatistics & research methodology",                   aiR:4, mkt:8 },
      { name:"Community health program design",                        aiR:1, mkt:7 },
      { name:"Health promotion & behavioral counseling",               aiR:2, mkt:7 },
      { name:"Surveillance & outbreak response",                       aiR:3, mkt:8 }
    ]},
  "Psychiatry":{ t:"low", n:"Psychiatry is among the least automatable specialties. Therapeutic alliance, trauma-informed care, and nuanced diagnostic interviewing depend on human presence and relationship.",
    s:[
      { name:"Therapeutic alliance & psychotherapy techniques",        aiR:1, mkt:9 },
      { name:"Diagnostic interviewing & mental status examination",    aiR:1, mkt:8 },
      { name:"Psychopharmacology management",                          aiR:3, mkt:8 },
      { name:"Crisis assessment & suicide risk stratification",        aiR:1, mkt:9 },
      { name:"Trauma-informed & culturally responsive care",           aiR:1, mkt:9 },
      { name:"Collaborative care & systems integration",               aiR:1, mkt:8 },
      { name:"Patient & family psychoeducation",                       aiR:2, mkt:8 }
    ]},
  "Child & Adolescent Psychiatry":{ t:"low", n:"Child and adolescent psychiatry is among the most human-dependent specialties. Developmental nuance, family systems work, and the therapeutic relationship with minors cannot be automated.",
    s:[
      { name:"Developmental & psychiatric assessment in children",     aiR:1, mkt:9 },
      { name:"Family therapy & systemic intervention",                 aiR:1, mkt:8 },
      { name:"Child & adolescent psychopharmacology",                  aiR:2, mkt:8 },
      { name:"Trauma-informed care for minors",                        aiR:1, mkt:9 },
      { name:"School & social systems navigation",                     aiR:1, mkt:8 },
      { name:"Crisis intervention in pediatric populations",           aiR:1, mkt:9 },
      { name:"Neurodevelopmental disorder management (ADHD, autism)",  aiR:2, mkt:9 }
    ]},
  "Pediatrics":{ t:"low", n:"Pediatric care is relationship-intensive, developmentally complex, and family-centered. AI has limited pediatric training data. Developmental assessment and family communication are highly defensible.",
    s:[
      { name:"Developmental assessment across age groups",             aiR:1, mkt:8 },
      { name:"Family-centered care & communication",                   aiR:1, mkt:8 },
      { name:"Pediatric pharmacology & weight-based dosing",           aiR:3, mkt:7 },
      { name:"Newborn & neonatal assessment",                          aiR:2, mkt:8 },
      { name:"Child protection recognition & advocacy",                aiR:1, mkt:8 },
      { name:"Vaccine-preventable disease management",                 aiR:3, mkt:7 },
      { name:"Adolescent medicine & mental health",                    aiR:1, mkt:8 }
    ]},
  "Physical Medicine & Rehabilitation":{ t:"low", n:"Functional assessment, therapeutic relationships, and hands-on rehabilitation planning are deeply human. The core of PM&R is defensible.",
    s:[
      { name:"Functional assessment & rehabilitation goal-setting",    aiR:1, mkt:8 },
      { name:"Electrodiagnostic procedures (EMG/NCS)",                 aiR:2, mkt:7 },
      { name:"Spasticity management & interventional procedures",      aiR:1, mkt:8 },
      { name:"Prosthetics & orthotics prescription",                   aiR:2, mkt:7 },
      { name:"Pain medicine & interventional techniques",              aiR:2, mkt:8 },
      { name:"Neurological rehabilitation planning",                   aiR:1, mkt:8 },
      { name:"Patient & family education for disability management",   aiR:1, mkt:7 }
    ]},
  "Geriatric Medicine":{ t:"low", n:"Geriatric care is relationship-intensive, multi-system complex, and requires holistic decision-making across frailty, cognition, and goals of care.",
    s:[
      { name:"Comprehensive geriatric assessment",                     aiR:1, mkt:9 },
      { name:"Dementia diagnosis & management",                        aiR:2, mkt:9 },
      { name:"Polypharmacy review & deprescribing",                    aiR:3, mkt:8 },
      { name:"Fall prevention & mobility assessment",                  aiR:2, mkt:8 },
      { name:"Goals of care & advance care planning",                  aiR:1, mkt:9 },
      { name:"Frailty & functional status optimization",               aiR:1, mkt:8 },
      { name:"Caregiver support & family systems",                     aiR:1, mkt:8 }
    ]},
  "Palliative Medicine":{ t:"low", n:"Palliative care is one of the most defensible medical specialties. Emotional presence, goals of care conversations, and symptom management at end of life are irreducibly human.",
    s:[
      { name:"Serious illness communication & goals of care",          aiR:1, mkt:9 },
      { name:"Symptom management (pain, dyspnea, nausea)",             aiR:2, mkt:9 },
      { name:"Advance care planning & advance directives",             aiR:2, mkt:8 },
      { name:"Family communication & bereavement support",             aiR:1, mkt:8 },
      { name:"Interdisciplinary palliative care team leadership",      aiR:1, mkt:9 },
      { name:"Ethical decision-making in complex cases",               aiR:1, mkt:9 },
      { name:"Spiritual & existential care coordination",              aiR:1, mkt:7 }
    ]},
  "Sports Medicine":{ t:"low", n:"Sports medicine requires hands-on musculoskeletal assessment, procedural skill, and athlete relationship management. AI cannot replace clinical examination.",
    s:[
      { name:"Musculoskeletal examination & sports injury diagnosis",  aiR:2, mkt:8 },
      { name:"Ultrasound-guided joint & soft tissue procedures",       aiR:1, mkt:8 },
      { name:"Return-to-play decision-making",                         aiR:1, mkt:8 },
      { name:"Exercise prescription & performance optimization",       aiR:3, mkt:8 },
      { name:"Concussion assessment & management",                     aiR:2, mkt:8 },
      { name:"Athlete mental health & performance psychology",         aiR:1, mkt:8 },
      { name:"Team physician & sideline responsibilities",             aiR:1, mkt:7 }
    ]},
  "Addiction Medicine":{ t:"low", n:"Addiction medicine is deeply relationship-based. Motivational interviewing, harm reduction counseling, and long-term patient support are irreducibly human.",
    s:[
      { name:"Substance use disorder assessment & diagnosis",          aiR:2, mkt:9 },
      { name:"Medication-assisted treatment (MAT) management",         aiR:3, mkt:9 },
      { name:"Motivational interviewing & behavioral counseling",      aiR:1, mkt:9 },
      { name:"Harm reduction & overdose prevention",                   aiR:1, mkt:9 },
      { name:"Co-occurring mental health & addiction management",      aiR:1, mkt:8 },
      { name:"Withdrawal management & detoxification",                 aiR:2, mkt:8 },
      { name:"Social determinants of health & recovery support",       aiR:1, mkt:8 }
    ]},
  "Pain Medicine":{ t:"low", n:"Chronic pain management requires empathy, complex biopsychosocial assessment, and individualized treatment planning. Interventional procedures are hands-on.",
    s:[
      { name:"Chronic pain assessment & biopsychosocial evaluation",   aiR:1, mkt:8 },
      { name:"Interventional pain procedures (epidural, nerve block, RFA)", aiR:1, mkt:9 },
      { name:"Opioid therapy management & risk stratification",        aiR:3, mkt:8 },
      { name:"Multidisciplinary pain treatment coordination",          aiR:1, mkt:8 },
      { name:"Psychological aspects of chronic pain",                  aiR:1, mkt:8 },
      { name:"Neuromodulation techniques (spinal cord stimulation)",   aiR:1, mkt:8 },
      { name:"Non-opioid pharmacotherapy management",                  aiR:3, mkt:8 }
    ]},
  "Plastic Surgery":{ t:"low", n:"Artistic surgical judgment, reconstructive decision-making, and tactile surgical skill are difficult to automate.",
    s:[
      { name:"Reconstructive surgical technique & flap design",        aiR:1, mkt:8 },
      { name:"Aesthetic procedural judgment",                          aiR:1, mkt:9 },
      { name:"Wound management & tissue transfer",                     aiR:2, mkt:8 },
      { name:"Hand surgery & microsurgery",                            aiR:1, mkt:8 },
      { name:"Craniofacial & pediatric plastic surgery",               aiR:1, mkt:8 },
      { name:"Burn management",                                        aiR:2, mkt:8 },
      { name:"Artistic spatial reasoning & outcome aesthetics",        aiR:1, mkt:8 }
    ]}
};

const OPP = [
  { name:"Osteopathic structural examination & somatic dysfunction diagnosis", aiR:1, mkt:8 },
  { name:"Osteopathic manipulative treatment (OMT)",                          aiR:1, mkt:8 }
];

const GROUPS = {
  "Internal Medicine & Subspecialties": ["Internal Medicine","Cardiology","Pulmonary & Critical Care","Gastroenterology","Nephrology","Rheumatology","Endocrinology","Infectious Disease","Hematology & Oncology","Geriatric Medicine","Sleep Medicine"],
  "Primary Care & Community": ["Family Medicine","Pediatrics","Preventive Medicine","Sports Medicine","Addiction Medicine"],
  "Surgery": ["General Surgery","Orthopaedic Surgery","Urology","Obstetrics & Gynecology","Otolaryngology","Vascular Surgery","Thoracic Surgery","Neurological Surgery","Plastic Surgery"],
  "Imaging & Diagnostics": ["Diagnostic Radiology","Neuroradiology","Interventional Radiology","Pathology","Nuclear Medicine","Medical Genetics & Genomics"],
  "Specialized Disciplines": ["Dermatology","Ophthalmology","Emergency Medicine","Physical Medicine & Rehabilitation","Neonatal-Perinatal Medicine","Pediatric Cardiology","Pain Medicine","Radiation Oncology"],
  "Mental Health & Neurology": ["Psychiatry","Child & Adolescent Psychiatry","Neurology"],
  "Anesthesia & Critical Care": ["Anesthesiology","Pulmonary & Critical Care"],
  "Other Specialties": ["Palliative Medicine","Geriatric Medicine"]
};

const LEVELS = ["Medical Student","Resident","Fellow","Attending Physician"];

const THREAT = {
  low:      { col:"#059669", label:"Minimal AI Exposure",      desc:"Human presence, relationship, and tactile skill dominate. AI is an assistant, not a replacement for clinical judgment." },
  moderate: { col:"#d97706", label:"Moderate AI Integration", desc:"AI is automating specific tasks. Core clinical judgment remains defensible." },
  high:     { col:"#f97316", label:"High AI Augmentation",     desc:"Multiple AI systems are FDA-cleared in this specialty. Defensible skills require deliberate investment." },
  critical: { col:"#dc2626", label:"Extensive AI Transformation", desc:"AI matches or exceeds specialist performance on core tasks. The defensible zone™ must be actively constructed." }
};

const T = {
  bg:"#f8f9fb", surf:"#ffffff", card:"#ffffff",
  bdr:"#dde1ea", txt:"#0d1117", mut:"#1e2a42", dim:"#4a5568",
  amb:"#d97706", blu:"#2563eb", grn:"#059669", org:"#ea580c", red:"#dc2626",
  font:"'DM Sans',system-ui,sans-serif",
  mono:"'DM Mono','Courier New',monospace",
  disp:"'DM Serif Display',Georgia,serif"
};

const GCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=DM+Mono:wght@400;600&family=DM+Serif+Display&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  input,select,button{font-family:inherit;outline:none}
  input[type=range]{-webkit-appearance:none;appearance:none;height:4px;background:#dde1ea;border-radius:2px;border:none;cursor:pointer;width:100%}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:#d97706;border-radius:50%;cursor:pointer;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.15)}
  input[type=range].dz-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none}
  input[type=range].dz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)}
  input[type=range].conscience-sl::-webkit-slider-thumb{background:#7c3aed}
  input[type=range].pull-sl::-webkit-slider-thumb{background:#0891b2}
  input[type=range].fluency-sl::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#d97706;border:2px solid white;cursor:pointer}
`;

function snapToStop(val) {
  const stops = [0, 3, 5, 7, 10];
  return stops.reduce((prev, curr) => (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev));
}
function getSeed(c, p) {
  const stops = [0, 3, 5, 7, 10];
  const raw = Math.round((c * 0.5 + p * 0.5) * 10) / 10;
  return stops.reduce((prev, curr) => (Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : prev));
}
function compAff(conscience, pull, fluency) {
  return Math.round((conscience * 0.35 + pull * 0.35 + fluency * 0.3) * 10) / 10;
}
function calcDZ(aff, aiR, mkt) { return Math.min(100, Math.round(100 * Math.pow(aff/10, 0.35) * Math.pow((10-aiR)/10, 0.40) * Math.pow(mkt/10, 0.25))); }
function dzCol(s) { if(s>=70)return T.grn; if(s>=45)return T.amb; if(s>=25)return T.org; return T.red; }
function dzLbl(s) { if(s>=70)return"Defensible"; if(s>=45)return"Moderate Risk"; if(s>=25)return"Growth Area"; return"Needs Attention"; }

function MCard({children,style,className}){ return <div className={className} style={{background:T.card,border:"1px solid "+T.bdr,borderRadius:14,padding:24,...style}}>{children}</div>; }
function MLbl({children,col,style}){ return <div style={{fontFamily:T.mono,fontSize:11,color:col||T.amb,letterSpacing:".1em",fontWeight:700,textTransform:"uppercase",marginBottom:10,...style}}>{children}</div>; }
function MMono({children,style}){ return <span style={{fontFamily:T.mono,fontSize:12,...style}}>{children}</span>; }
function MTag({children,col}){ return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,fontFamily:T.mono,fontSize:11,fontWeight:700,color:col,background:col+"18",border:"1px solid "+col+"40",whiteSpace:"nowrap"}}>{children}</span>; }
function MBtn({children,onClick,disabled,style}){
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?T.surf:T.amb,color:disabled?T.dim:"#ffffff",border:"1px solid "+(disabled?T.bdr:T.amb),borderRadius:10,padding:"14px 24px",fontFamily:T.mono,fontSize:13,fontWeight:700,letterSpacing:".06em",cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,transition:"all .15s",...style}}>{children}</button>;
}
function MGhost({children,onClick,style}){ return <button onClick={onClick} style={{background:"transparent",color:T.mut,border:"1px solid "+T.bdr,borderRadius:10,padding:"12px 20px",fontFamily:T.mono,fontSize:12,fontWeight:600,cursor:"pointer",...style}}>{children}</button>; }

function ThreatBar({level}){
  const pos={low:12.5,moderate:37.5,high:62.5,critical:87.5};
  const pct=pos[level]||37.5;
  const col=(THREAT[level]||THREAT.moderate).col;
  return(
    <svg viewBox="0 0 400 44" style={{width:"100%",display:"block",marginBottom:8}}>
      <defs><linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="33%" stopColor="#d97706"/>
        <stop offset="66%" stopColor="#f97316"/>
        <stop offset="100%" stopColor="#dc2626"/>
      </linearGradient></defs>
      <rect x="0" y="10" width="400" height="14" rx="7" fill="url(#tg)" opacity="0.18"/>
      <rect x="0" y="10" width={pct*4} height="14" rx="7" fill="url(#tg)" opacity="0.7"/>
      <circle cx={pct*4} cy="17" r="9" fill={col} stroke="white" strokeWidth="2.5"/>
      <text x="2"   y="40" fontFamily="DM Mono,monospace" fontSize="9" fill="#9aa3b2">Low</text>
      <text x="120" y="40" fontFamily="DM Mono,monospace" fontSize="9" fill="#9aa3b2">Moderate</text>
      <text x="244" y="40" fontFamily="DM Mono,monospace" fontSize="9" fill="#9aa3b2">High</text>
      <text x="358" y="40" fontFamily="DM Mono,monospace" fontSize="9" fill="#9aa3b2">Critical</text>
    </svg>
  );
}


// ── LOCAL RECOMMENDATION ENGINE ──────────────────────────────────
// Actions are grounded in published evidence and real resources:
// - Ericsson KA. Deliberate Practice. Psych Review 1993.
// - Warm EJ et al. Entrustment and Competency. J Grad Med Educ 2014.
// - Densen P. Challenges and Opportunities Facing Medical Education. Trans Am Clin Climatol Assoc 2011.
// - ACGME Milestones 2.0 developmental progression framework
// - CanMEDS 2015 Scholar and Health Advocate roles
// ─────────────────────────────────────────────────────────────────

const LEVEL_ACTIONS = {
  "Medical Student": {
    portfolio:   "By each Sunday of clerkship, add one structured write-up using an AAMC MedEdPORTAL peer-reviewed teaching resource as your outline (browse and download templates at mededportal.org), then mirror the same case in your school’s required portfolio or ERAS-compatible document so program directors see concrete evidence on interview day.",
    mentor:      "Within two weeks, email your clerkship coordinator to request pairing with a resident or fellow (not only an attending) who covers this competency weekly; schedule a recurring 20-minute monthly check-in. Near-peer mentors give more actionable, less idealized advice (Buddeberg-Fischer et al., Swiss Med Wkly 2006).",
    complexity:  "Each clerkship week, ask your attending to assign you lead on one deliberately complex patient note in this domain (multi-organ, atypical, or conflicting data). Direct exposure to diagnostic uncertainty is where clinical reasoning develops (Schmidt & Mamede, Med Educ 2015); within 24 hours of discharge or sign-out, add one sentence to your portfolio on what changed your thinking.",
    read:        "Every Sunday, run PubMed (pubmed.ncbi.nlm.nih.gov) with the “Sort by: Best match” or “Publication date” filter plus a saved alert for your competency keywords; read one full article and archive the PDF with a three-bullet summary in Zotero or Paperpile before Monday rounds.",
    board:       "Block 45 minutes on three fixed weekdays each week for UWorld or AMBOSS (uworld.com or amboss.com) question sets filtered to this competency domain. Active recall during training builds long-term retention far more effectively than passive reading (Kornell & Bjork, Psych Sci 2008)."
  },
  "Resident": {
    portfolio:   "Within 48 hours of each qualifying encounter, enter the case in your ACGME Case Log System with diagnosis, procedure, and your role spelled out (access via your program’s GME office link to the specialty-specific ACGME Case Log portal) so fellowship directors can verify breadth and complexity at annual review.",
    mentor:      "On the first of each month, secure one direct-observation session with an attending who models this competency and complete a written mini-CEX or equivalent structured feedback form the same week. Feedback frequency, not just quality, is the strongest predictor of skill development (Veloski et al., Acad Med 2006).",
    complexity:  "Each rotation, volunteer first for the atypical admission or consult in this domain—the patient your attending would usually manage solo—and debrief for 10 minutes after handoff; add one line to your patient list about which judgment call stretched you.",
    read:        "Reserve a weekly Wednesday block to read one original investigation from NEJM (nejm.org), JAMA (jamanetwork.com/journals/jama), or The Lancet (thelancet.com), or from your ABMS specialty board’s affiliated flagship journal (find the exact title under “Publications” on your board or society homepage—e.g., American College of Radiology → Journal of the American College of Radiology at jacr.org). Read methods and results, not only the discussion.",
    teach:       "On every inpatient or clinic team, deliver one 15-minute chalk talk to a medical student on this skill with two practice questions you wrote yourself. The protege effect — teaching to learn — produces measurably deeper retention and understanding (Nestojko et al., Memory & Cognition 2014)."
  },
  "Fellow": {
    portfolio:   "Before fellowship graduation, assemble a de-identified case series or QI dataset of at least five patients in this competency with local IRB or QI exemption as required, and submit an abstract through your specialty society’s annual meeting portal (e.g., AHA, ATS, RSNA submission sites) or a PubMed-indexed case outlet using that society’s author instructions.",
    mentor:      "When your specialty society posts its annual scientific program (online registration site), register within two weeks and add three hands-on workshops or named expert symposia mapped to this competency; attend debrief notes within 48 hours to lock learning.",
    complexity:  "Each month, coordinate with your program director to lead work-up on one referral that would typically go to a tertiary center; within one week of disposition, present a single-slide summary at fellow conference summarizing decision forks.",
    research:    "Within six months, charter a single-site QI or outcomes project with a clear denominator, start date, and end date; plan dissemination to a society-affiliated journal or Implementation Science Communications (implementationsciencecom.biomedcentral.com) so your attending-job CV shows subspecialty depth beyond clinical volume alone.",
    network:     "Within 30 days, activate trainee membership in the subspecialty society that matches your pathway (examples: Society for Cardiovascular Angiography and Interventions at scai.org; American Association for the Study of Liver Diseases at aasld.org; Society of Nuclear Medicine and Molecular Imaging at snmimaging.org) and complete one live webinar plus one discussion board introduction in their trainee community."
  },
  "Attending Physician": {
    cme:         "In the next 90 days, complete at least 8 AMA PRA Category 1 Credit™ hours in this competency through your specialty society’s CME catalog (e.g., American College of Cardiology ACC Anywhere at acc.org; American College of Radiology education at acr.org/Education) or the society’s annual meeting transcript upload.",
    mentor:      "By month’s end, recruit one peer from your medical staff roster or the society member directory for a bimonthly 45-minute structured case swap (send the case summary 48 hours ahead); alternate sites if you practice at more than one hospital.",
    complexity:  "Each quarter, accept at least two community referrals explicitly flagged complex in this domain and document your consultant note in the EHR within your group’s published turnaround window. Your defensible zone™ deepens fastest at the edge of competency, not from routine volume alone.",
    teach:       "Before the next academic year, propose one resident or fellow didactic (grand rounds or noon conference) on this competency and, if available, apply for voluntary faculty or clinical educator designation through your GME office so teaching enters your promotion dossier—formal teaching is among the most reliable ways to maintain attending-level mastery.",
    leadership:  "Within 90 days, ask your chair or chief medical officer which committee—quality, credentials, or clinical standards—touches this competency, and request appointment or a 90-day pilot charter with one measurable endpoint (e.g., adherence metric or safety event rate) tied to CanMEDS Leader and Health Advocate roles (Frank et al., CanMEDS 2015)."
  }
};

const SKILL_RESOURCES = {
  aiR_high: [
    "Within 60 days, enroll in your specialty society’s AI curriculum (examples: ACR AI-LAB learning modules at ailab.acr.org/Learn/Index; American College of Cardiology search “artificial intelligence” at acc.org; American Academy of Neurology online education at aan.com) and complete the module block on error modes and clinician oversight; spend one hour monthly maintaining that competency.",
    "Within two weeks, read the FDA webpage “Artificial Intelligence and Machine Learning (AI/ML)-Enabled Medical Devices” and download the linked AI/ML Software as a Medical Device Action Plan PDF from fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices; bookmark the public device list entries that match your specialty so you know labeling limits before deployment.",
    "Each month, lead debrief on one atypical case in this domain where an AI suggestive output was wrong, incomplete, or ignored context; document the human override rationale in your standard sign-out or M&M template. Oversight of such exceptions is the clinical surface ACGME Milestones 2.0 and society AI statements now treat as core professional work."
  ],
  aiR_low: [
    "Quarterly, add one tangible artifact to your promotion or credentialing file for this competency—complication review summary, patient-reported outcome snippet, or peer-solicited letter—so low AI replaceability shows up as evidence, not assumption. Human judgment in ambiguous care remains comparatively advantaged in recent specialty-level reviews (Shehab et al., PMC 2024).",
    "Pick one metric your EHR or registry already exports (complications, length of stay, or selected patient experience scores), filter to this clinical domain, and review a six-month run chart with your division chief or quality lead once per quarter; set one tweak for the next quarter based on the trend.",
    "Within 12 months, target a PubMed-indexed case report, outcomes note, or QI brief in this area using your society’s author instructions (posted on the society website); co-authorship is fine—the goal is a durable public signal that your expertise is current."
  ],
  mkt_high: [
    "Within 14 days, update your LinkedIn, Doximity, and hospital faculty profile with this competency as a keyword-rich capability bullet plus one hyperlink to a talk, project, or metric. PwC’s 2025 AI Jobs Barometer reported workers who could demonstrate high-demand analytical and digital skills earned roughly 56% more than peers without those signals—make yours machine- and human-readable.",
    "On the last Friday of each month, send a one-page “clinical pearl” email to your top ten referring physicians or post a slide to your department’s shared drive illustrating how you apply this skill, so demand converts into referrals and committee invitations.",
    "Within six months, confirm at abms.org and your specialty board’s website whether added or subspecialty certification exists for this domain; if eligible, map examination or case-log deadlines onto your calendar with your program director, coach, or board liaison."
  ],
  mkt_low: [
    "Unless this competency anchors your mission, cap optional development at employer or board minima and reallocate at least four hours monthly to a higher-market-demand skill flagged elsewhere on your report.",
    "If you must improve, complete only named AMA PRA Category 1 activities tied to a regulatory or safety mandate (document the activity ID on your transcript) rather than open-ended fellowship-style study."
  ]
};

function buildRecs(results, specialty, level, degree) {
  const threat = (SD[specialty] || {}).t || "moderate";
  const la = LEVEL_ACTIONS[level] || LEVEL_ACTIONS["Resident"];
  const recs = [];

  const doubleDown = results.filter(r => r.dz >= 70);
  const strengthen = results.filter(r => r.dz >= 45 && r.dz < 70 && r.naturalAffinity >= 6);
  const pivot      = results.filter(r => r.dz < 45 && r.naturalAffinity >= 6 && r.aiR >= 7);
  const upskill    = results.filter(r => r.dz < 65 && r.naturalAffinity >= 6 && r.aiR < 7 && r.mkt >= 7);
  const reassess   = results.filter(r => r.dz < 35 && r.naturalAffinity < 4 && r.aiR >= 7);

  if (doubleDown.length > 0) {
    recs.push({
      icon: "",
      col: "#059669",
      title: "Protect and deepen your current defensible zone™",
      skills: doubleDown.map(r => r.name),
      actions: [
        la.complexity,
        la.portfolio,
        SKILL_RESOURCES.aiR_low[1],
        level === "Attending Physician" ? la.teach : la.mentor,
        SKILL_RESOURCES.mkt_high[0]
      ]
    });
  }

  if (strengthen.length > 0) {
    recs.push({
      icon: "",
      col: "#d97706",
      title: "Strengthen affinity into documented mastery",
      skills: strengthen.map(r => r.name),
      actions: [
        la.mentor,
        la.complexity,
        la.read,
        "By the end of this month, download your specialty’s ACGME Milestones 2.0 PDF from acgme.org, highlight the Level 4 narrative examples for these skills, and add one planned behavior per skill you will demonstrate on your next rotation or clinic block.",
        SKILL_RESOURCES.mkt_high[1]
      ]
    });
  }

  if (pivot.length > 0) {
    recs.push({
      icon: "",
      col: "#f97316",
      title: "Pivot toward the complex edge of work you already enjoy",
      skills: pivot.map(r => r.name),
      actions: [
        "Within the next 90 days, own work-up on two presentations in this competency that involve rare diagnoses, conflicting data, or multisystem decision-making—patterns underrepresented in publicly listed FDA-cleared AI/ML device training data (review summaries at fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices); schedule attending review within 48 hours of key decisions.",
        SKILL_RESOURCES.aiR_high[0],
        SKILL_RESOURCES.aiR_high[2],
        "Before your next semi-annual learning-plan update, start the American Board of Artificial Intelligence in Medicine pathway (abaim.org) or your program’s mapped AI curriculum, and cite ACGME Milestones 2.0 expectations for systems-based practice and emerging technology when you meet with your advisor.",
        degree === "DO" ? "On your next two complex admissions, dictate or write the assessment section to foreground osteopathic structural and whole-person findings (per COCA and ACGME Osteopathic Recognition expectations) so your chart mirrors the clinical lens pattern-recognition AI lacks." : la.teach
      ]
    });
  }

  if (upskill.length > 0) {
    recs.push({
      icon: "",
      col: "#2563eb",
      title: "Invest now where demand and human premium align",
      skills: upskill.map(r => r.name),
      actions: [
        "Treat this cluster as your highest-return portfolio lane for the next 36 months: pairing strong market demand with low AI substitution lets you compound reputation, referrals, and leadership opportunities faster than in commoditized tasks.",
        la.cme || la.read,
        la.mentor,
        SKILL_RESOURCES.mkt_high[2],
        "Densen (Trans Am Clin Climatol Assoc 2011) estimated medical knowledge doubles roughly every 73 days; protect your wage premium by blocking a recurring 90-minute Friday session for deliberate reading or simulation in these skills, tracked on your calendar like a procedure day."
      ]
    });
  }

  if (reassess.length > 0) {
    recs.push({
      icon: "",
      col: "#dc2626",
      title: "Channel growth through strengths that motivate you",
      skills: reassess.map(r => r.name),
      actions: [
        "Pair future study hours with competencies you rated high on natural affinity: Ericsson’s deliberate-practice evidence (Psychol Rev 1993) shows motivation gates depth, so you will climb faster by investing where curiosity already pulls you while still meeting baseline expectations here.",
        "Within two weeks, review the ACGME Milestones 2.0 minimum entrustment behaviors and your specialty board maintenance-of-certification requirements for this area (posted on acgme.org and your board site); document only what satisfies patient safety and credentialing, then pause discretionary projects.",
        SKILL_RESOURCES.mkt_low[1],
        "Reallocate the time you might have spent chasing mastery here toward the high-affinity, high-demand, low-AI-risk skills elsewhere in this report; schedule that swap on your calendar so the hours actually move."
      ]
    });
  }

  const strategyMap = {
    critical: [
      "Over the next 12 months, position yourself to co-lead safe AI deployment: your specialty sits among the densest concentrations of FDA-cleared AI/ML-enabled devices (historically about three-quarters of listed devices tied to imaging-related indications in public FDA inventories). Within 90 days, finish either the ACR AI-LAB learning track at ailab.acr.org/Learn/Index or your own specialty society’s AI curriculum page under its Education tab, then bring one governance slide to division meeting.",
      "Within 60 days, finish the society module track you chose above and add a one-page cheat sheet to your department wiki listing when to trust, adjust, or turn off algorithm output for your common workflows.",
      "Before the next academic year, enroll in one hands-on simulation or cadaver/procedure lab block that demands real-time tactile feedback and complication rescue; pair it with Entrustable Professional Activities from your ACGME specialty milestones so entrustment keeps pace with procedural depth.",
      degree === "DO" ? "Starting this month, template your consult or procedure note so osteopathic whole-person assessment (per ACGME Osteopathic Recognition and AACOM UME guidance) appears in every complex case discussion—making your distinct clinical reasoning visible alongside imaging AI outputs." : "Within six months, declare a written professional development plan naming the most complex or procedurally intensive niche in your field (society curriculum pathway + mentor sign-off) so depth, not breadth, becomes your public brand as algorithms absorb routine reads."
    ],
    high: [
      "Within 30 days, read the AMA’s Augmented Intelligence in Health Care policy report PDF (https://www.ama-assn.org/system/files/2019-01/augmented-intelligence-policy-report.pdf) plus the 2024 AMA AI principles PDF (https://www.ama-assn.org/system/files/ama-ai-principles.pdf); list three AI tools your department actually uses and assign yourself oversight checkpoints for each tool by quarter-end.",
      "Pick the two competencies in your report that demand clinical judgment, negotiated care, or manual skill, and book recurring mentorship or simulation for them through your GME office or society for the next three academic years.",
      "Before the next society business meeting, email the staff liaison for the artificial intelligence, informatics, or digital health committee (contact info on the society website) to volunteer for a 90-day workgroup; contributing to guidelines is a durable defensible zone™ alongside bedside work.",
      degree === "DO" ? "Within the quarter, present one complex multi-system case at conference that weaves OPP with subspecialty data, citing how whole-person framing changes management—this is the integrative edge AI-assisted silos often miss." : "Within 12 months, explore Added Qualification in Clinical Informatics via the American Board of Preventive Medicine (abpm.org) or your primary board’s informatics pathway, pairing exam deadlines with your institution’s informatics grand rounds schedule."
    ],
    moderate: [
      "This quarter, map ACGME Milestones 2.0 systems-based practice and emerging technology sub-competencies (2024 publications on acgme.org) onto your rotation or clinic goals so AI literacy becomes a documented growth trajectory rather than a checkbox.",
      "Weekly for eight weeks, record one patient interaction where you used shared decision-making or agenda-setting, then compare your language to the patient-centered communication behaviors tied to better outcomes in Stewart et al. (J Fam Pract 2000); adjust one phrase before the next visit.",
      "If POCUS applies to your specialty, register for Society of Point-of-Care Ultrasound (spocus.org) or American College of Emergency Physicians (acep.org) POCUS coursework within 60 days and log 25 supervised scans against your specialty’s milestone entrustment targets.",
      level === "Medical Student" || level === "Resident" ? "Each week, identify one case where your initial diagnosis was wrong or incomplete and, before Friday, write a three-sentence reflection on what misled you—this mirrors the reflective-diagnosis exercise Mamede et al. (Med Educ 2012) showed accelerates accuracy gains faster than additional factual reading alone." : "Before year-end, charter a 120-day quality, education, or patient-safety project with your chair, citing CanMEDS Leader and Scholar roles (Frank et al., CanMEDS 2015) and ACGME systems-based practice milestones; present interim data at your service’s business meeting."
    ],
    low: [
      "Your specialty’s human core—relationship, presence, nuanced negotiation—remains comparatively resistant to substitution in recent cross-specialty analyses (Shehab et al., PMC 2024); plan quarterly storytelling or communication drills so those strengths stay sharp as documentation AI expands.",
      "Within 60 days, register for an American Academy on Communication in Healthcare course (aachonline.org/courses) or workshop and implement two scripted communication behaviors (agenda setting, teach-back) in clinic the following week.",
      "This month, pilot one ambient or speech-enabled documentation tool your health system approves (vendor workflow with IT) and reinvest the saved Tuesday afternoon block into uninterrupted patient education or shared decision-making—AMA physician practice and health resources (ama-assn.org/practice-management/physician-health) continue to highlight documentation burden as a major wellness strain you can redesign deliberately.",
      degree === "DO" ? "Add OMT or osteopathic structural exam documentation to every eligible patient this quarter using AACOM/COCA vocabulary so payers and consult teams see tactile, low-automation value that anchors your professional identity." : "Each quarter, accept or request one referral your partners label “difficult” or rare, and publish a de-identified teaching point to your division list—deep expertise in exceptions remains the most durable human niche as AI absorbs averages."
    ]
  };

  recs.push({
    icon: "",
    col: "#7c3aed",
    title: "Overall strategy — " + level + " in " + specialty,
    skills: [],
    actions: strategyMap[threat] || strategyMap.moderate
  });

  return recs;
}

// ── PROMO CODES ────────────────────────────────────────────────────────
const PROMO_CODES_MED = ["DZFRIEND", "DZPREVIEW", "DZTEST"];

function PaywallGateMedical({ onUnlock }) {
  const [input, setInput]   = React.useState("");
  const [error, setError]   = React.useState("");
  const [shake, setShake]   = React.useState(false);

  function tryPromo() {
    if (PROMO_CODES_MED.map(c => c.toLowerCase()).includes(input.trim().toLowerCase())) {
      onUnlock(3, true);
    } else {
      setError("Invalid code. Try again or purchase below.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <MCard className="no-print" style={{marginBottom:14}}>
      <style>{`@keyframes dzShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{width:36,height:36,background:T.amb,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:18}}>🔒</span>
        </div>
        <div>
          <MLbl style={{marginBottom:2}}>Unlock Your Full Report</MLbl>
          <MMono style={{color:T.mut,fontSize:11}}>Your DZ score is above. Go deeper with a personalized action plan.</MMono>
        </div>
      </div>

      {/* Tier cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>

        {/* Tier 2 — $29 */}
        <div style={{background:T.bg,border:"2px solid "+T.amb,borderRadius:12,padding:16}}>
          <MLbl style={{marginBottom:6}}>Recommendations</MLbl>
          <div style={{fontFamily:T.disp,fontSize:28,color:T.txt,lineHeight:1,marginBottom:4}}>$29<span style={{fontFamily:T.mono,fontSize:13,fontWeight:400,color:T.dim}}> one-time</span></div>
          <ul style={{margin:"10px 0 14px",padding:0,listStyle:"none"}}>
            {["Personalized action plan","Steps ranked by impact & effort","Skills to protect vs deprioritize","AI landscape timeline for your specialty"].map(item=>(
              <li key={item} style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:5}}>
                <span style={{color:T.amb,fontWeight:700,flexShrink:0,marginTop:1}}>✓</span>
                <MMono style={{color:T.mut,fontSize:11,lineHeight:1.5}}>{item}</MMono>
              </li>
            ))}
          </ul>
          {/* TODO: Replace onClick with Stripe checkout for $29 */}
          <MBtn onClick={() => window.open("https://buy.stripe.com/4gM3cv4wWbnldpP2FwdQQ04","_blank")} style={{width:"100%"}}>
            Get Recommendations →
          </MBtn>
        </div>

        {/* Tier 3 — $34 */}
        <div style={{background:T.bg,border:"2px solid #1a1d2e",borderRadius:12,padding:16,position:"relative"}}>
          <div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:"#1a1d2e",color:"white",fontFamily:T.mono,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,letterSpacing:"0.1em",whiteSpace:"nowrap"}}>BEST VALUE</div>
          <MLbl col="#1a1d2e" style={{marginBottom:6}}>Recommendations + PDF</MLbl>
          <div style={{fontFamily:T.disp,fontSize:28,color:T.txt,lineHeight:1,marginBottom:4}}>$34<span style={{fontFamily:T.mono,fontSize:13,fontWeight:400,color:T.dim}}> one-time</span></div>
          <ul style={{margin:"10px 0 14px",padding:0,listStyle:"none"}}>
            {["Everything in Recommendations","Branded PDF you can save & share","Ready for career coaches & advisors","Permanent record of your assessment"].map(item=>(
              <li key={item} style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:5}}>
                <span style={{color:"#1a1d2e",fontWeight:700,flexShrink:0,marginTop:1}}>✓</span>
                <MMono style={{color:T.mut,fontSize:11,lineHeight:1.5}}>{item}</MMono>
              </li>
            ))}
          </ul>
          {/* TODO: Replace onClick with Stripe checkout for $34 */}
          <button
            onClick={() => window.open("https://buy.stripe.com/00waEX4wWdvtdpP7ZQdQQ05","_blank")}
            style={{width:"100%",background:"#1a1d2e",color:"white",border:"none",borderRadius:8,padding:"11px 0",fontFamily:T.mono,fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em"}}
          >Get PDF Report →</button>
        </div>
      </div>

      {/* Promo code */}
      <div style={{borderTop:"1px solid "+T.bdr,paddingTop:16}}>
        <MMono style={{color:T.dim,fontWeight:700,letterSpacing:"0.08em",display:"block",marginBottom:8,fontSize:11}}>HAVE A PROMO CODE?</MMono>
        <div style={{display:"flex",gap:8,animation:shake?"dzShake 0.4s ease":"none"}}>
          <input
            value={input}
            onChange={e=>{setInput(e.target.value);setError("");}}
            onKeyDown={e=>{if(e.key==="Enter")tryPromo();}}
            placeholder="Enter code"
            style={{flex:1,background:T.bg,border:"1px solid "+(error?T.red:T.bdr),borderRadius:8,padding:"10px 14px",fontSize:13,fontFamily:T.mono,color:T.txt,outline:"none"}}
          />
          <button
            onClick={tryPromo}
            style={{background:T.surf,border:"1px solid "+T.bdr,borderRadius:8,padding:"10px 18px",fontSize:12,fontFamily:T.mono,fontWeight:700,color:T.mut,cursor:"pointer",letterSpacing:"0.06em"}}
          >APPLY</button>
        </div>
        {error && <MMono style={{color:T.red,display:"block",marginTop:6,fontWeight:600,fontSize:11}}>{error}</MMono>}
      </div>
    </MCard>
  );
}

export default function DefensibleZoneMedical(){
  const [step,        setStep]        = useState(0);
  const [degree,      setDegree]      = useState("");
  const [level,       setLevel]       = useState("");
  const [specialty,   setSpecialty]   = useState("");
  const [skills,      setSkills]      = useState([]);
  const [conscience,  setConscience]  = useState(5);
  const [pull,        setPull]        = useState(5);
  const [fluencies,   setFluencies]   = useState({});
  const [adjustedSkills, setAdjustedSkills] = useState(new Set());
  const adjustedSkillsRef = useRef(new Set());
  const [results,     setResults]     = useState(null);
  const [showGuide,   setShowGuide]   = useState(true);
  const [showDO,      setShowDO]      = useState(false);
  const [showCite,    setShowCite]    = useState(false);
  const [showRecs,    setShowRecs]    = useState(true);
  const [tier,        setTier]        = useState(0); // 0=free, 2=recs, 3=pdf
  const [promoUsed,   setPromoUsed]   = useState(false);
  const [emailInput,  setEmailInput]  = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  function markAdjusted(id) {
    adjustedSkillsRef.current.add(id);
    setAdjustedSkills(new Set(adjustedSkillsRef.current));
  }

  useEffect(() => {
    setFluencies(prev => {
      const next = { ...prev };
      skills.forEach((_, idx) => {
        if (!adjustedSkillsRef.current.has(idx)) {
          next[idx] = getSeed(conscience, pull);
        }
      });
      return next;
    });
  }, [conscience, pull, skills]);

  async function submitEmailToKit(email) {
    try {
      await fetch("https://api.convertkit.com/v3/forms/9309751/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: "OtIv3L3SPCCcxped1fYkLw", email: email, fields: { source: "doctor" } })
      });
    } catch(e) { /* silent fail */ }
  }

  async function handleEmailAndContinue() {
    const email = emailInput.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailSubmitting(true);
    await submitEmailToKit(email);
    setEmailSubmitting(false);
    runAnalysis();
  }

  function handleUnlock(t, isPromo) { setTier(t); if (isPromo) setPromoUsed(true); }

  // ── Payment verification ────────────────────────────────────────────────
  useEffect(() => {
    function decodeJwt(token) {
      try {
        const payload = token.split(".")[1];
        const padded = payload + "===".slice((payload.length + 3) % 4);
        return JSON.parse(atob(padded));
      } catch (e) { return null; }
    }

    function applyToken(token) {
      const decoded = decodeJwt(token);
      if (!decoded) return false;
      if (decoded.exp && Date.now() / 1000 > decoded.exp) return false;
      if (decoded.product && decoded.product !== "doctor") return false;
      if (decoded.tier === 2 || decoded.tier === 3) {
        setTier(decoded.tier);
        return true;
      }
      return false;
    }

    // 1. Try existing token from localStorage
    const stored = localStorage.getItem("dz_token_doctor");
    if (stored && applyToken(stored)) return;

    // 2. Fresh redirect from Stripe — verify session_id with backend
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      window.history.replaceState({}, "", window.location.pathname);
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, product: "doctor" }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem("dz_token_doctor", data.token);
            applyToken(data.token);
          }
        })
        .catch(err => console.error("Payment verification failed:", err));
    }
  }, []);

  function loadSkills(spec){
    const data = SD[spec];
    if(!data) return;
    const s = degree === "DO" ? [...data.s, ...OPP] : [...data.s];
    setSkills(s);
    setFluencies({});
    setAdjustedSkills(new Set());
    adjustedSkillsRef.current = new Set();
  }

  function runAnalysis(){
    const scored = skills.map((sk,i)=>{
      const f   = fluencies[i] !== undefined ? fluencies[i] : getSeed(conscience, pull);
      const aff = compAff(conscience, pull, f);
      const dz  = calcDZ(aff, sk.aiR, sk.mkt);
      return { name:sk.name, naturalAffinity:aff, investment:f, affinity:aff, aiR:sk.aiR, mkt:sk.mkt, dz };
    });
    setResults(scored);
    setStep(3);
  }

  function reset(){
    setStep(0); setDegree(""); setLevel(""); setSpecialty(""); setSkills([]);
    setConscience(5); setPull(5); setFluencies({}); setAdjustedSkills(new Set());
    adjustedSkillsRef.current = new Set();
    setResults(null); setTier(0); setPromoUsed(false);
  }

  // ── Step 0 ──────────────────────────────────────────────────────
  if(step===0){
    return(
      <div style={{minHeight:"100vh",background:T.bg,padding:"40px 24px",fontFamily:T.font,color:T.txt}}>
        <style>{GCSS}</style>
        <div style={{marginBottom:16}}>
  <a href="/" style={{fontFamily:T.mono,fontSize:12,color:T.mut,textDecoration:"none",letterSpacing:"0.06em",fontWeight:600}}>← DEFENSIBLE ZONE&#8482;</a>
</div>
        <div style={{maxWidth:520,margin:"0 auto"}}>
          <div style={{marginBottom:40}}>
            <MMono style={{color:T.amb,letterSpacing:".14em",display:"block",marginBottom:14}}>DEFENSIBLE ZONE&#8482; · MEDICAL EDITION</MMono>
            <h1 style={{fontFamily:T.disp,fontSize:42,fontWeight:400,lineHeight:1.1,marginBottom:14}}>
              Where do you stand<br/><span style={{color:T.amb}}>in the AI era of medicine?</span>
            </h1>
            <p style={{color:T.mut,fontSize:15,lineHeight:1.75}}>Map your clinical skills against AI displacement risk and market demand. Grounded in ACGME Milestones 2.0, CanMEDS 2015, and peer-reviewed clinical AI literature.</p>
          </div>
          <MCard>
            <MLbl>Your Degree</MLbl>
            <div style={{display:"flex",gap:10,marginBottom:24}}>
              {["MD","DO"].map(d=>(
                <button key={d} onClick={()=>setDegree(d)} style={{flex:1,padding:"18px 12px",borderRadius:10,fontFamily:T.mono,fontSize:15,fontWeight:700,cursor:"pointer",border:"2px solid "+(degree===d?T.amb:T.bdr),background:degree===d?T.amb+"12":T.surf,color:degree===d?T.amb:T.mut,transition:"all .15s"}}>
                  {d}
                  <div style={{fontSize:11,fontWeight:400,marginTop:4,color:degree===d?T.amb:T.dim}}>{d==="DO"?"Osteopathic Medicine":"Allopathic Medicine"}</div>
                </button>
              ))}
            </div>
            {degree==="DO"&&(
              <div style={{background:T.grn+"0e",border:"1px solid "+T.grn+"30",borderRadius:10,padding:"12px 16px",marginBottom:20}}>
                <MMono style={{color:T.grn,fontWeight:700,display:"block",marginBottom:4}}>DO track includes OPP skills</MMono>
                <MMono style={{color:T.mut,lineHeight:1.6,display:"block"}}>Osteopathic structural examination and OMT are added to your skill set. These hands-on, embodied competencies are irreplaceable by AI.</MMono>
              </div>
            )}
            <MLbl>Your Current Level</MLbl>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:26}}>
              {LEVELS.map(l=>(
                <button key={l} onClick={()=>setLevel(l)} style={{padding:"13px 16px",borderRadius:8,fontSize:14,fontWeight:500,cursor:"pointer",textAlign:"left",border:"1px solid "+(level===l?T.amb:T.bdr),background:level===l?T.amb+"0e":T.surf,color:level===l?T.txt:T.mut,transition:"all .15s"}}>{l}</button>
              ))}
            </div>
            <MBtn onClick={()=>setStep(1)} disabled={!degree||!level} style={{width:"100%"}}>Select Specialty</MBtn>
          </MCard>
        </div>
      </div>
    );
  }

  // ── Step 1 ──────────────────────────────────────────────────────
  if(step===1){
    return(
      <div style={{minHeight:"100vh",background:T.bg,padding:"40px 24px",fontFamily:T.font,color:T.txt}}>
        <style>{GCSS}</style>
        <div style={{maxWidth:620,margin:"0 auto"}}>
          <button onClick={()=>setStep(0)} style={{fontFamily:T.mono,fontSize:12,color:T.dim,background:"none",border:"none",cursor:"pointer",marginBottom:18}}>back</button>
          <h2 style={{fontFamily:T.disp,fontSize:32,fontWeight:400,marginBottom:6}}>Select your specialty</h2>
          <p style={{color:T.mut,fontSize:14,marginBottom:20,lineHeight:1.6}}>{degree} &middot; {level}</p>
          <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
            {Object.entries(THREAT).map(([k,v])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:v.col}}/>
                <MMono style={{color:T.dim,fontSize:11}}>{v.label.replace(" AI Landscape","")}</MMono>
              </div>
            ))}
          </div>
          {Object.entries(GROUPS).map(([group,specs])=>(
            <div key={group} style={{marginBottom:20}}>
              <MMono style={{color:T.dim,display:"block",marginBottom:8,letterSpacing:".06em",textTransform:"uppercase",fontSize:11}}>{group}</MMono>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {[...new Set(specs)].filter(s=>SD[s]).map(spec=>{
                  const sd=SD[spec]; const tm=THREAT[sd.t]; const sel=specialty===spec;
                  return(
                    <button key={spec} onClick={()=>setSpecialty(spec)} style={{padding:"7px 12px",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",border:"1px solid "+(sel?T.amb:T.bdr),background:sel?T.amb+"12":T.surf,color:sel?T.txt:T.mut,display:"flex",alignItems:"center",gap:6,transition:"all .12s"}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:tm.col,flexShrink:0}}/>
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {specialty&&SD[specialty]&&(
            <MCard style={{marginBottom:16,background:THREAT[SD[specialty].t].col+"0a",border:"1px solid "+THREAT[SD[specialty].t].col+"30"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                <MTag col={THREAT[SD[specialty].t].col}>{THREAT[SD[specialty].t].label}</MTag>
                <span style={{fontSize:15,fontWeight:700,color:T.txt}}>{specialty}</span>
              </div>
              <p style={{color:T.mut,fontSize:13,lineHeight:1.7,margin:0}}>{SD[specialty].n}</p>
            </MCard>
          )}
          <MBtn onClick={()=>{loadSkills(specialty);setStep(2);}} disabled={!specialty} style={{width:"100%"}}>Rate My Skills</MBtn>
        </div>
      </div>
    );
  }

  // ── Step 2 ──────────────────────────────────────────────────────
  if(step===2){
    const affinityStops = [0, 3, 5, 7, 10];
    const conscienceLabelTexts = ["Move on easily","Mildly bothered","Somewhat unsettled","Want to revisit it","Can't let it go"];
    const pullLabelTexts = ["Almost never","Occasionally","Sometimes","Regularly","Constantly"];
    return(
      <div style={{minHeight:"100vh",background:T.bg,padding:"40px 24px",fontFamily:T.font,color:T.txt}}>
        <style>{GCSS}</style>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <button onClick={()=>setStep(1)} style={{fontFamily:T.mono,fontSize:12,color:T.dim,background:"none",border:"none",cursor:"pointer",marginBottom:18}}>back to specialty</button>
          <h2 style={{fontFamily:T.disp,fontSize:30,fontWeight:400,marginBottom:8}}>How does clinical work feel?</h2>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <MTag col={T.amb}>{degree}</MTag>
            <MTag col={T.blu}>{level}</MTag>
            <MTag col={T.mut}>{specialty}</MTag>
          </div>
          <p style={{fontSize:16,color:"#6b7280",lineHeight:1.7,marginBottom:32,marginTop:0}}>
            These questions aren&apos;t about how skilled you are. They&apos;re about whether this work genuinely fits you. Be honest — there are no wrong answers.
          </p>
          <div style={{fontFamily:T.mono,fontSize:12,textTransform:"uppercase",color:"#7a88a8",marginBottom:6}}>PART 1 — ABOUT YOU IN GENERAL</div>
          <div style={{fontSize:15,color:"#7a88a8",marginBottom:24}}>Answer these once. They apply across all your skills.</div>
          <div style={{background:T.card,border:"1px solid #d0d7e8",borderRadius:14,padding:"24px 28px",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{width:10,height:10,borderRadius:"50%",background:"#7c3aed",flexShrink:0}} />
              <span style={{fontFamily:T.mono,fontSize:12,fontWeight:700,color:"#7c3aed",letterSpacing:"0.08em"}}>CRAFT CONSCIENCE</span>
            </div>
            <p style={{fontSize:16,fontStyle:"italic",color:"#3d4a6b",lineHeight:1.6,marginBottom:6,marginTop:0}}>
              When you leave a clinical encounter feeling it was incomplete — a diagnosis that didn&apos;t fully add up, a patient conversation that was rushed — how does that sit with you?
            </p>
            <p style={{fontSize:14,color:"#7a88a8",lineHeight:1.5,marginBottom:20,marginTop:0}}>
              This tells us whether you genuinely care about clinical quality independent of whether anyone reviewed, measured, or noticed.
            </p>
            <input
              className="dz-slider conscience-sl"
              type="range"
              min={0}
              max={10}
              step={1}
              value={conscience}
              onChange={e=>setConscience(snapToStop(Number(e.target.value)))}
              style={{background:"linear-gradient(to right, #7c3aed "+(conscience/10)*100+"%, #d0d7e8 "+(conscience/10)*100+"%)"}}
            />
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
              {affinityStops.map((stopValue,idx)=>(
                <div key={stopValue} style={{width:"20%",textAlign:"center",fontSize:12,color:"#7c3aed",opacity:Math.abs(conscience-stopValue)<=1?1:0.25,fontWeight:Math.abs(conscience-stopValue)<=1?700:400}}>
                  {conscienceLabelTexts[idx]}
                </div>
              ))}
            </div>
          </div>
          <div style={{background:T.card,border:"1px solid #d0d7e8",borderRadius:14,padding:"24px 28px",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{width:10,height:10,borderRadius:"50%",background:"#0891b2",flexShrink:0}} />
              <span style={{fontFamily:T.mono,fontSize:12,fontWeight:700,color:"#0891b2",letterSpacing:"0.08em"}}>INTRINSIC PULL</span>
            </div>
            <p style={{fontSize:16,fontStyle:"italic",color:"#3d4a6b",lineHeight:1.6,marginBottom:6,marginTop:0}}>
              Outside of clinical work — evenings, weekends, off-shift — how often does your mind drift toward medicine? A case you couldn&apos;t resolve, something you read, a problem you want to understand better?
            </p>
            <p style={{fontSize:14,color:"#7a88a8",lineHeight:1.5,marginBottom:20,marginTop:0}}>
              This tells us whether medicine is something you&apos;re genuinely wired for, or primarily a professional identity and career.
            </p>
            <input
              className="dz-slider pull-sl"
              type="range"
              min={0}
              max={10}
              step={1}
              value={pull}
              onChange={e=>setPull(snapToStop(Number(e.target.value)))}
              style={{background:"linear-gradient(to right, #0891b2 "+(pull/10)*100+"%, #d0d7e8 "+(pull/10)*100+"%)"}}
            />
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
              {affinityStops.map((stopValue,idx)=>(
                <div key={stopValue} style={{width:"20%",textAlign:"center",fontSize:12,color:"#0891b2",opacity:Math.abs(pull-stopValue)<=1?1:0.25,fontWeight:Math.abs(pull-stopValue)<=1?700:400}}>
                  {pullLabelTexts[idx]}
                </div>
              ))}
            </div>
          </div>
          <hr style={{border:"none",borderTop:"1px solid #d0d7e8",margin:"32px 0"}} />
          <div style={{fontFamily:T.mono,fontSize:12,textTransform:"uppercase",color:"#7a88a8",marginBottom:6}}>PART 2 — SKILL BY SKILL</div>
          <div style={{fontSize:15,color:"#7a88a8",lineHeight:1.6,marginBottom:8}}>
            For each skill — does doing this work feel natural and easy, or does it take real effort?
          </div>
          <div style={{fontSize:14,color:"#9ca3af",marginBottom:24}}>
            Sliders are pre-set based on your answers above. Only move one if a skill feels noticeably different from your usual pattern.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {skills.map((sk,i)=>{
              const fluencyVal = fluencies[i] !== undefined ? fluencies[i] : getSeed(conscience, pull);
              const affinityScore = compAff(conscience, pull, fluencyVal);
              const affinityColor = affinityScore >= 7 ? "#059669" : affinityScore >= 5 ? "#d97706" : "#dc2626";
              const isOPP = degree==="DO" && OPP.some(o=>o.name===sk.name);
              const fluencyForGrad = fluencies[i] !== undefined ? fluencies[i] : getSeed(conscience, pull);
              return(
                <div
                  key={i}
                  style={{
                    background:T.card,
                    border:"1px solid #d0d7e8",
                    borderLeft:isOPP?"4px solid "+T.grn:"1px solid #d0d7e8",
                    borderRadius:12,
                    padding:"18px 22px",
                    marginBottom:0
                  }}
                >
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{flex:1,paddingRight:12}}>
                      <div style={{fontSize:16,fontWeight:600,color:T.txt}}>{sk.name}</div>
                      {isOPP&&<MMono style={{color:T.grn,display:"block",marginTop:6,fontWeight:700}}>OPP skill — naturally defensible against AI</MMono>}
                    </div>
                    <span style={{
                      fontSize:12,
                      padding:"2px 8px",
                      borderRadius:10,
                      fontFamily:T.mono,
                      flexShrink:0,
                      background:adjustedSkills.has(i)?"rgba(217,119,6,0.12)":"rgba(5,150,105,0.10)",
                      color:adjustedSkills.has(i)?"#d97706":"#059669"
                    }}>
                      {adjustedSkills.has(i)?"adjusted":"pre-seeded"}
                    </span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontFamily:T.mono,fontSize:12,color:"#7a88a8"}}>FELT FLUENCY</span>
                    <span style={{fontFamily:T.mono,fontSize:12,fontWeight:700,color:"#d97706"}}>{fluencyForGrad}/10</span>
                  </div>
                  <input
                    className="dz-slider fluency-sl"
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={fluencyVal}
                    onChange={e=>{
                      const val = Number(e.target.value);
                      setFluencies(prev=>({ ...prev, [i]: val }));
                      markAdjusted(i);
                    }}
                    style={{background:"linear-gradient(to right, #d97706 "+(fluencyForGrad/10)*100+"%, #d0d7e8 "+(fluencyForGrad/10)*100+"%)"}}
                  />
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                    <span style={{fontSize:12,color:"#9ca3af"}}>Effortful</span>
                    <span style={{fontSize:12,color:"#9ca3af"}}>Frictionless</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTop:"1px solid #f0f0f0"}}>
                    <span style={{fontFamily:T.mono,fontSize:12,color:"#7a88a8"}}>AFFINITY SCORE</span>
                    <span style={{fontSize:22,fontWeight:700,color:affinityColor}}>{affinityScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <MBtn onClick={()=>setStep(2.5)} disabled={skills.length===0} style={{width:"100%",marginTop:32}}>See My Defensible Zone&#8482;</MBtn>
        </div>
      </div>
    );
  }

  // ── Step 2.5: EMAIL CAPTURE ─────────────────────────────────────────────
  if(step===2.5){
    return (
      <div style={{background:T.bg,minHeight:"100vh",fontFamily:T.sans,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
        <div style={{maxWidth:480,width:"100%",background:T.surf,border:"1px solid "+T.bdr,borderRadius:16,padding:"40px 36px",textAlign:"center"}}>
          <MMono style={{color:T.amb,fontSize:11,letterSpacing:"0.14em",fontWeight:600,display:"block",marginBottom:16}}>ONE LAST THING</MMono>
          <h2 style={{fontFamily:T.serif,fontSize:26,color:T.txt,margin:"0 0 12px",lineHeight:1.2}}>Want to save your results?</h2>
          <p style={{color:T.mut,fontSize:15,lineHeight:1.7,margin:"0 0 28px"}}>Drop your email and we'll send you a copy. You'll also get occasional updates when the AI landscape shifts for your specialty. No spam.</p>
          <input
            type="email"
            placeholder="your@email.com"
            value={emailInput}
            onChange={e=>setEmailInput(e.target.value)}
            style={{width:"100%",boxSizing:"border-box",padding:"14px 16px",fontSize:15,border:"1px solid "+T.bdr,borderRadius:10,fontFamily:T.sans,color:T.txt,background:T.bg,marginBottom:12,outline:"none"}}
          />
          <MBtn onClick={handleEmailAndContinue} disabled={emailSubmitting} style={{width:"100%",marginBottom:12}}>
            {emailSubmitting ? "SENDING…" : "GET MY RESULTS →"}
          </MBtn>
        </div>
      </div>
    );
  }

  // ── Step 3 ──────────────────────────────────────────────────────
  if(step===3&&results){
    const sd    = SD[specialty]||{};
    const tm    = THREAT[sd.t||"moderate"];
    const avgDZ = Math.round(results.reduce((s,r)=>s+r.dz,0)/(results.length||1));
    const def   = results.filter(r=>r.dz>=70).length;
    const risk  = results.filter(r=>r.dz<45).length;
    const sorted = [...results].sort((a,b)=>b.dz-a.dz);
    const showAllRecs = tier >= 2 || promoUsed;
    const showUpsell = tier === 0 && !promoUsed;
    const recList = buildRecs(results, specialty, level, degree);
    return(
      <div style={{minHeight:"100vh",background:T.bg,padding:"40px 24px",fontFamily:T.font,color:T.txt}}>
        <style>{GCSS}</style>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{marginBottom:24}}>
            <MMono style={{color:T.amb,letterSpacing:".14em",display:"block",marginBottom:10}}>DEFENSIBLE ZONE&#8482; &mdash; RESULTS</MMono>
            <h1 style={{fontFamily:T.disp,fontSize:32,fontWeight:400,marginBottom:8}}>{specialty}</h1>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><MTag col={T.amb}>{degree}</MTag><MTag col={T.blu}>{level}</MTag></div>
          </div>

          <MCard style={{marginBottom:14,background:tm.col+"08",border:"1px solid "+tm.col+"30"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <MLbl col={tm.col} style={{marginBottom:0}}>AI Landscape Assessment &mdash; {specialty}</MLbl>
              <MTag col={tm.col}>{tm.label}</MTag>
            </div>
            <ThreatBar level={sd.t||"moderate"}/>
            <p style={{color:T.mut,fontSize:13,lineHeight:1.75,margin:0}}>{sd.n||tm.desc}</p>
          </MCard>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[["Avg DZ Score",avgDZ,dzCol(avgDZ)],["Defensible",def,T.grn],["Needs Attention",risk,T.red],["Skills Assessed",results.length,T.blu]].map(([l,v,c])=>(
              <div key={l} style={{background:T.card,border:"1px solid "+T.bdr,borderRadius:12,padding:"14px 16px"}}>
                <div style={{fontFamily:T.disp,fontSize:28,color:c,lineHeight:1,marginBottom:4}}>{v}</div>
                <MMono style={{color:T.dim,fontSize:11,letterSpacing:".06em"}}>{String(l).toUpperCase()}</MMono>
              </div>
            ))}
          </div>

          <MCard style={{marginBottom:14}}>
            <MLbl>Skill Risk Matrix</MLbl>
            <p style={{color:T.dim,fontSize:13,fontFamily:T.mono,marginBottom:16,marginTop:-6}}>Sorted by DZ score. AI risk and market demand are evidence-based estimates for {level} in {specialty}.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sorted.map((sk,i)=>{
                const col=dzCol(sk.dz);
                return(
                  <div key={i} style={{borderLeft:"4px solid "+col,borderRadius:"0 12px 12px 0",background:col+"07",border:"1px solid "+col+"25",borderLeftWidth:4,padding:"16px 20px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8}}>
                      <span style={{fontSize:15,fontWeight:700,color:T.txt,flex:1,paddingRight:8}}>{sk.name}</span>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontFamily:T.disp,fontSize:26,color:col,lineHeight:1}}>{sk.dz}</div>
                          <MMono style={{color:T.dim,fontSize:11,letterSpacing:".04em"}}>DZ</MMono>
                        </div>
                        <MTag col={col}>{dzLbl(sk.dz)}</MTag>
                      </div>
                    </div>
                    <div style={{height:5,background:T.bdr,borderRadius:3,marginBottom:12,overflow:"hidden"}}>
                      <div style={{height:"100%",width:sk.dz+"%",background:"linear-gradient(90deg,"+col+"55,"+col+")",borderRadius:3}}/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {[["Natural Affinity",sk.naturalAffinity+"/10",T.blu],["Investment",sk.investment+"/10",T.amb],["AI Risk",sk.aiR+"/10",T.red],["Mkt Demand",sk.mkt+"/10",T.grn]].map(([l,v,c])=>(
                        <div key={l}>
                          <MMono style={{color:T.dim,fontSize:11,display:"block",marginBottom:3}}>{l}</MMono>
                          <MMono style={{color:c,fontWeight:700,fontSize:13}}>{v}</MMono>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:14,marginTop:16,paddingTop:14,borderTop:"1px solid "+T.bdr,flexWrap:"wrap"}}>
              {[{s:70,l:"70+ Defensible"},{s:45,l:"45-69 Moderate"},{s:25,l:"25-44 Growth Area"},{s:0,l:"Under 25 Needs Attention"}].map(({s,l})=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:10,height:10,borderRadius:2,background:dzCol(s)}}/>
                  <MMono style={{color:T.dim,fontSize:11}}>{l}</MMono>
                </div>
              ))}
            </div>
          </MCard>

          <div style={{ background: "#f2f4f8", borderRadius: 12, padding: "16px 20px", marginTop: 8, marginBottom: 14 }}>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 12,
                textTransform: "uppercase",
                color: T.dim,
                letterSpacing: "0.06em",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              HOW YOUR SCORE IS CALCULATED
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#3d4a6b", margin: "0 0 12px" }}>
              Your DZ score combines three inputs. Affinity reflects how naturally this clinical work fits you — composed of Craft Conscience, Intrinsic Pull,
              and Felt Fluency. AI Resistance is how hard it is for current AI systems to replicate this clinical skill at this physician&apos;s level. Market
              Demand is the current value of this skill in the medical labor market. The three are multiplied together using a Cobb-Douglas formula — a high
              score requires strength in all three, not just one.
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af", fontStyle: "italic", margin: 0, lineHeight: 1.65 }}>
              Scores are grounded in ACGME Milestones 2.0, CanMEDS 2015, and peer-reviewed clinical AI literature. Weights are literature-informed and pending
              empirical validation.
            </p>
          </div>

          <MCard style={{marginBottom:14}}>
              <style>{`@media print{body *{visibility:hidden}#dz-med-print,#dz-med-print *{visibility:visible}#dz-med-print{position:absolute;left:0;top:0;width:100%}.no-print{display:none!important}}`}</style>
              <div id="dz-med-print">
              {tier >= 3 && !promoUsed && (
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                  <button
                    onClick={()=>window.open("https://buy.stripe.com/00waEX4wWdvtdpP7ZQdQQ05","_blank")}
                    style={{background:T.amb,color:"white",border:"none",borderRadius:8,padding:"8px 18px",fontSize:12,fontFamily:T.mono,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:6}}
                  >⬇ Download PDF Report</button>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <button onClick={()=>setShowRecs(v=>!v)} className="no-print" style={{background:"none",border:"none",cursor:"pointer",padding:0,flex:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <MLbl style={{marginBottom:0}}>What To Do &mdash; Strengthening Your Defensible Zone&#8482;</MLbl>
                  <MMono style={{color:T.dim}}>{showRecs?"▲ Collapse":"▼ Expand"}</MMono>
                </button>
                {showRecs && showAllRecs && (
                  <button
                    className="no-print"
                    onClick={()=>window.print()}
                    style={{background:T.bg,border:"1px solid "+T.bdr,borderRadius:8,padding:"7px 14px",fontSize:12,fontFamily:T.mono,fontWeight:700,color:T.dim,cursor:"pointer",letterSpacing:"0.06em",marginLeft:12,flexShrink:0,display:"flex",alignItems:"center",gap:5}}
                  >⎙ Save as PDF</button>
                )}
              </div>
            {showRecs&&(
              <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:0}}>
                {recList.map(function(rec, ri){
                  var lockedBlur = !showAllRecs && ri > 0;
                  return (
                  <div key={ri} style={{
                    borderLeft:"4px solid "+rec.col,
                    paddingLeft:20, paddingTop:16, paddingBottom:16,
                    marginBottom:4,
                    borderRadius:"0 8px 8px 0",
                    background: ri%2===0 ? "transparent" : T.bg,
                    overflow:"hidden",
                    filter: lockedBlur ? "blur(5px)" : "none",
                    userSelect: lockedBlur ? "none" : "auto",
                    pointerEvents: lockedBlur ? "none" : "auto"
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:rec.skills.length>0?6:10}}>
                      <span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:rec.col,flexShrink:0}} />
                      <span style={{fontSize:16,fontWeight:700,color:T.txt,lineHeight:1.3}}>{rec.title}</span>
                    </div>
                    {rec.skills.length>0&&(
                      <div style={{fontFamily:T.mono,fontSize:11,color:rec.col,marginBottom:12,fontWeight:700,paddingLeft:18}}>
                        {rec.skills.join(" · ")}
                      </div>
                    )}
                    <div style={{display:"flex",flexDirection:"column",gap:8,paddingLeft:18}}>
                      {rec.actions.map((action,ai)=>(
                        <div key={ai} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <span style={{color:rec.col,flexShrink:0,fontWeight:700,marginTop:2,fontSize:13,lineHeight:1}}>→</span>
                          <span style={{color:T.mut,fontSize:15,lineHeight:1.7}}>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
            </div> {/* end dz-med-print */}
          </MCard>
          {showUpsell ? <PaywallGateMedical onUnlock={handleUnlock} /> : null}

          {degree==="DO"&&(
            <MCard style={{marginBottom:14,borderLeft:"4px solid "+T.grn}}>
              <button onClick={()=>setShowDO(v=>!v)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",padding:0}}>
                <MLbl col={T.grn} style={{marginBottom:0}}>Osteopathic Defensible Zone&#8482; &mdash; DO Advantage</MLbl>
                <MMono style={{color:T.dim}}>{showDO?"▲":"▼"}</MMono>
              </button>
              {showDO&&<p style={{color:T.mut,fontSize:14,lineHeight:1.8,marginTop:14}}>Osteopathic Principles and Practice (OPP) &mdash; somatic dysfunction diagnosis and OMT &mdash; are hands-on, embodied competencies requiring tactile sensitivity, clinical intuition, and whole-person assessment. No AI system can replicate these. The osteopathic philosophy of whole-person integrated care positions DO physicians to build therapeutic relationships and address root causes of illness, a natural defensible zone&#8482; as AI commoditizes task-based and pattern-recognition medicine.</p>}
            </MCard>
          )}

          <MCard style={{marginBottom:16}}>
            <button onClick={()=>setShowCite(v=>!v)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",padding:0}}>
              <MLbl col={T.dim} style={{marginBottom:0}}>Methodology &amp; Citations</MLbl>
              <MMono style={{color:T.dim}}>{showCite?"▲ Collapse":"▼ Show Sources"}</MMono>
            </button>
            {showCite&&(
              <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:8}}>
                {[
                  ["ACGME Competencies & Milestones 2.0","Nasca TJ et al. The Next GME Accreditation System. NEJM 2012;366:1051-1056. ACGME Milestones 2.0, 2024. acgme.org"],
                  ["CanMEDS 2015","Frank JR, Snell L, Sherbino J, eds. CanMEDS 2015 Physician Competency Framework. Royal College of Physicians and Surgeons of Canada; 2015. ISBN 978-1-926588-28-5"],
                  ["UME Foundational Competencies","AAMC, AACOM, ACGME. Foundational Competencies for Undergraduate Medical Education. December 2024. engage.aamc.org"],
                  ["AI Specialty Overview","Charalampous K et al. Artificial Intelligence in Medicine: A Specialty-Level Overview. PMC 2024. PMCID PMC12409705"],
                  ["AI Support vs Substitution","Shehab M et al. AI and medical specialties: support or substitution? PMC 2024. PMCID PMC11534378"],
                  ["FDA AI/ML Medical Devices","700 FDA-cleared AI/ML-based software as medical device algorithms as of 2024, 76% in diagnostic radiology. FDA AI/ML SaMD Action Plan database."],
                  ["Osteopathic Recognition","ACGME Osteopathic Recognition requirements. Unified accreditation system since 2020. acgme.org/what-we-do/recognition/osteopathic-recognition/"]
                ].map(([title,cite])=>(
                  <div key={title} style={{background:T.bg,border:"1px solid "+T.bdr,borderRadius:8,padding:"10px 14px"}}>
                    <MMono style={{color:T.amb,fontWeight:700,display:"block",marginBottom:4}}>{title}</MMono>
                    <p style={{color:T.mut,fontSize:12,margin:0,lineHeight:1.65,fontFamily:T.mono}}>{cite}</p>
                  </div>
                ))}
              </div>
            )}
          </MCard>

          <MGhost onClick={reset} style={{width:"100%"}}>Start New Assessment</MGhost>

          <div style={{background:"#fef9ec",border:"1px solid #f0c060",borderRadius:12,padding:"16px 20px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontFamily:T.mono,fontSize:12,color:"#92400e",fontWeight:700,marginBottom:4,letterSpacing:"0.06em"}}>IMPORTANT — PLEASE READ</div>
            <div style={{fontFamily:T.mono,fontSize:12,color:"#78350f",lineHeight:1.7}}>
              This tool is for professional reflection and educational purposes only. It does not constitute medical career advice or any professional assessment. Scores are estimates grounded in ACGME Milestones 2.0, CanMEDS 2015, and peer-reviewed clinical AI literature — not a definitive evaluation of your clinical skills or employability.
            </div>
          </div>

          <div style={{paddingTop:14,textAlign:"center"}}>
            <MMono style={{color:T.dim,display:"block",marginBottom:4,fontSize:11}}>
              DEFENSIBLE ZONE&#8482; is a trademark of its creator. All rights reserved.
            </MMono>
            <MMono style={{color:T.dim,display:"block",fontSize:11}}>
              &copy; 2026 &nbsp;&middot;&nbsp; Grounded in ACGME Milestones 2.0, CanMEDS 2015, and peer-reviewed clinical AI literature.
            </MMono>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
