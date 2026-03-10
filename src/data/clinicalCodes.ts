// Clinical codes and structured data based on Dr. Lebron's evaluation format

export interface CPTCode {
  code: string;
  description: string;
  category: string;
  protocols: ExerciseProtocol[];
}

export interface ExerciseProtocol {
  name: string;
  sets: string;
  reps: string;
  description: string;
  position?: string;
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

export interface FunctionalTest {
  name: string;
  normalRange?: string;
  units: string;
  description: string;
}

export interface MMTGrade {
  grade: string;
  description: string;
}

export interface AshworthScale {
  grade: string;
  description: string;
}

// CPT Codes with structured protocols from Dr. Lebron's evaluation
export const CPT_CODES: CPTCode[] = [
  {
    code: "97110",
    description: "Therapeutic Exercise",
    category: "Physical Medicine",
    protocols: [
      {
        name: "Quad-quad position exercises",
        sets: "1-2 sets",
        reps: "5-10 reps",
        description: "Quadruped position exercises as tolerated",
        position: "Quadruped"
      },
      {
        name: "Kneeling hip thrust",
        sets: "1-2 sets", 
        reps: "5-10 reps",
        description: "Hip thrust exercises in kneeling position"
      },
      {
        name: "AROM LE hip extension",
        sets: "1-2 sets",
        reps: "5-10 reps", 
        description: "Active range of motion lower extremity hip extension"
      },
      {
        name: "AROM LE hip abduction",
        sets: "1-2 sets",
        reps: "5-10 reps",
        description: "Active range of motion lower extremity hip abduction"
      }
    ]
  },
  {
    code: "97112", 
    description: "Neuromuscular education",
    category: "Physical Medicine",
    protocols: [
      {
        name: "Quad-quad position training",
        sets: "1-2 sets",
        reps: "5-10 reps",
        description: "Quadruped position neuromuscular training as tolerated"
      },
      {
        name: "Kneeling hip thrust training",
        sets: "1-2 sets",
        reps: "5-10 reps", 
        description: "Neuromuscular education for hip thrust in kneeling"
      },
      {
        name: "AROM LE hip extension training",
        sets: "1-2 sets",
        reps: "5-10 reps",
        description: "Neuromuscular education for hip extension"
      },
      {
        name: "Standing position training",
        sets: "1-2 sets",
        reps: "5-10 reps",
        description: "Standing position neuromuscular education"
      },
      {
        name: "Sit to stand training",
        sets: "1-2 sets", 
        reps: "5-10 reps",
        description: "Sit to stand neuromuscular training"
      },
      {
        name: "Balance exercises",
        sets: "1-2 sets",
        reps: "5-10 reps",
        description: "Balance and proprioception training"
      },
      {
        name: "Marcha in situ",
        sets: "1-2 sets",
        reps: "5-10 reps", 
        description: "Marching in place training"
      }
    ]
  },
  {
    code: "97116",
    description: "Gait Training",
    category: "Physical Medicine", 
    protocols: [
      {
        name: "Forward walking",
        sets: "Multiple",
        reps: "10-20 feet",
        description: "Forward gait training focusing on stride length and efficiency"
      },
      {
        name: "Backward steps",
        sets: "Multiple",
        reps: "10-20 feet",
        description: "Backward walking for gait training"
      },
      {
        name: "TUGT activities",
        sets: "Multiple",
        reps: "10-20 feet",
        description: "Timed Up and Go Test activities and training"
      },
      {
        name: "Stride length training",
        sets: "Multiple", 
        reps: "10-20 feet",
        description: "Focus on improving stride length and alternating steps"
      }
    ]
  }
];

// ICD-10 codes from the evaluation
export const ICD10_CODES: ICD10Code[] = [
  {
    code: "I69.351",
    description: "Hemiplegia and hemiparesis following cerebral infarction affecting right dominant side",
    category: "Cerebrovascular diseases"
  },
  {
    code: "R53.1", 
    description: "Weakness",
    category: "General symptoms and signs"
  },
  {
    code: "R26.2",
    description: "Difficulty in walking, not elsewhere classified", 
    category: "Symptoms and signs involving the nervous and musculoskeletal systems"
  },
  {
    code: "Z51.89",
    description: "Other specified aftercare",
    category: "Factors influencing health status"
  },
  {
    code: "M62.81",
    description: "Muscle weakness (generalized)",
    category: "Diseases of the musculoskeletal system"
  }
];

// Functional tests and measures
export const FUNCTIONAL_TESTS: FunctionalTest[] = [
  {
    name: "Time Up and Go Test (TUGT)",
    normalRange: "< 10 seconds",
    units: "seconds",
    description: "Timed test of functional mobility"
  },
  {
    name: "Five Times Sit to Stand",
    normalRange: "< 12 seconds", 
    units: "seconds",
    description: "Functional lower extremity strength test"
  },
  {
    name: "Grip Strength",
    normalRange: "Male: 46-56 lbs, Female: 23-30 lbs",
    units: "pounds",
    description: "Hand grip strength measurement"
  },
  {
    name: "Berg Balance Scale",
    normalRange: "45-56 points",
    units: "points",
    description: "Balance assessment scale"
  }
];

// MMT (Manual Muscle Testing) grades
export const MMT_GRADES: MMTGrade[] = [
  { grade: "5/5", description: "Normal - Complete range of motion against gravity with full resistance" },
  { grade: "4/5", description: "Good - Complete range of motion against gravity with some resistance" },
  { grade: "3/5", description: "Fair - Complete range of motion against gravity" },
  { grade: "2/5", description: "Poor - Complete range of motion with gravity eliminated" },
  { grade: "1/5", description: "Trace - Evidence of slight contractility, no joint motion" },
  { grade: "0/5", description: "Zero - No evidence of contractility" }
];

// Ashworth Scale for spasticity
export const ASHWORTH_SCALE: AshworthScale[] = [
  { grade: "0", description: "No increase in muscle tone" },
  { grade: "1", description: "Slight increase in muscle tone, catch and release or minimal resistance" },
  { grade: "1+", description: "Slight increase in muscle tone, catch followed by minimal resistance" },
  { grade: "2", description: "More marked increase in muscle tone through most of ROM, limb easily moved" },
  { grade: "3", description: "Considerable increase in muscle tone, passive movement difficult" },
  { grade: "4", description: "Affected part rigid in flexion or extension" }
];

// Body parts/joints for assessments
export const BODY_PARTS = [
  { name: "Hip Flexion", side: ["Right", "Left", "Bilateral"] },
  { name: "Hip Extension", side: ["Right", "Left", "Bilateral"] },
  { name: "Hip Abduction", side: ["Right", "Left", "Bilateral"] },
  { name: "Knee Extension", side: ["Right", "Left", "Bilateral"] },
  { name: "Knee Flexion", side: ["Right", "Left", "Bilateral"] },
  { name: "Ankle Dorsiflexion", side: ["Right", "Left", "Bilateral"] },
  { name: "Ankle Plantarflexion", side: ["Right", "Left", "Bilateral"] },
  { name: "Shoulder Flexion", side: ["Right", "Left", "Bilateral"] },
  { name: "Shoulder Extension", side: ["Right", "Left", "Bilateral"] },
  { name: "Elbow Flexion", side: ["Right", "Left", "Bilateral"] },
  { name: "Elbow Extension", side: ["Right", "Left", "Bilateral"] },
  { name: "Wrist Flexion", side: ["Right", "Left", "Bilateral"] },
  { name: "Wrist Extension", side: ["Right", "Left", "Bilateral"] }
];

// Transfer types and independence levels
export const TRANSFER_TYPES = [
  "Bed to Chair",
  "Chair to Bed", 
  "Sit to Stand",
  "Stand to Sit",
  "Floor to Standing",
  "Car Transfers",
  "Toilet Transfers",
  "Shower/Tub Transfers"
];

export const INDEPENDENCE_LEVELS = [
  { level: "Independent", description: "Patient performs task safely without assistance" },
  { level: "Modified Independent", description: "Patient requires assistive device but no human assistance" },
  { level: "Supervision", description: "Patient requires standby assistance for safety" },
  { level: "Contact Guard", description: "Patient requires hands-on contact for balance/safety" },
  { level: "Minimal Assist", description: "Patient performs 75% or more of task" },
  { level: "Moderate Assist", description: "Patient performs 50-74% of task" },
  { level: "Maximal Assist", description: "Patient performs 25-49% of task" },
  { level: "Total Assist", description: "Patient performs less than 25% of task" }
];

// Goal templates based on the evaluation
export const GOAL_TEMPLATES = [
  {
    category: "Mobility",
    template: "Patient will decrease TUGT from {current} seconds to {target} seconds with {assistance_level}",
    measurable: true,
    timeframe: "12 PT sessions"
  },
  {
    category: "Strength", 
    template: "Demonstrate increase in {body_part} strength by performing {task} {independence_level}",
    measurable: true,
    timeframe: "12 PT sessions"
  },
  {
    category: "Function",
    template: "Will demonstrate at least {number} HEP exercises with proper form and technique",
    measurable: true,
    timeframe: "12 PT sessions"
  },
  {
    category: "Balance",
    template: "Improve balance score from {current} to {target} on {assessment_tool}",
    measurable: true,
    timeframe: "12 PT sessions"
  },
  {
    category: "Gait",
    template: "Increase gait speed from {current} to {target} with {assistance_level}",
    measurable: true,
    timeframe: "12 PT sessions"
  }
];
