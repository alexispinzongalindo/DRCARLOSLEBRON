// Comprehensive Clinical Codes Database for Physical Therapy Practice
// Covers all major PT specialties: Orthopedic, Neurologic, Pediatric, Geriatric, Sports, Cardiopulmonary

export interface CPTCode {
  code: string;
  description: string;
  category: string;
  specialty: string[];
  protocols: ExerciseProtocol[];
  conditions: string[];
}

export interface ExerciseProtocol {
  name: string;
  sets: string;
  reps: string;
  description: string;
  position?: string;
  equipment?: string;
  progression?: string;
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  specialty: string[];
  commonAssessments: string[];
  typicalGoals: string[];
}

// COMPREHENSIVE CPT CODES FOR PHYSICAL THERAPY
export const COMPREHENSIVE_CPT_CODES: CPTCode[] = [
  // THERAPEUTIC PROCEDURES
  {
    code: "97110",
    description: "Therapeutic Exercise",
    category: "Therapeutic Procedures",
    specialty: ["Orthopedic", "Neurologic", "Pediatric", "Geriatric", "Sports"],
    conditions: ["All musculoskeletal and neurological conditions"],
    protocols: [
      {
        name: "Strengthening - Upper Extremity",
        sets: "2-3 sets",
        reps: "8-15 reps",
        description: "Progressive resistance exercises for shoulder, elbow, wrist",
        equipment: "Weights, resistance bands, pulleys"
      },
      {
        name: "Strengthening - Lower Extremity",
        sets: "2-3 sets", 
        reps: "8-15 reps",
        description: "Progressive resistance exercises for hip, knee, ankle",
        equipment: "Weights, resistance bands, leg press"
      },
      {
        name: "Core Stabilization",
        sets: "2-3 sets",
        reps: "10-30 seconds hold",
        description: "Trunk strengthening and stabilization exercises",
        position: "Supine, prone, side-lying, sitting, standing"
      },
      {
        name: "Functional Strengthening",
        sets: "2-3 sets",
        reps: "5-15 reps",
        description: "Task-specific strengthening activities",
        progression: "Body weight → resistance → functional loads"
      },
      {
        name: "Plyometric Training",
        sets: "3-4 sets",
        reps: "5-10 reps",
        description: "Explosive movement training for sports return",
        equipment: "Plyometric boxes, medicine balls"
      }
    ]
  },
  {
    code: "97112",
    description: "Neuromuscular Re-education",
    category: "Therapeutic Procedures", 
    specialty: ["Neurologic", "Orthopedic", "Pediatric", "Geriatric"],
    conditions: ["CVA", "TBI", "SCI", "Balance disorders", "Proprioceptive deficits"],
    protocols: [
      {
        name: "Balance Training - Static",
        sets: "3-5 sets",
        reps: "30-60 seconds",
        description: "Static balance activities on various surfaces",
        equipment: "Balance pads, BOSU, foam"
      },
      {
        name: "Balance Training - Dynamic",
        sets: "2-3 sets", 
        reps: "10-20 reps",
        description: "Dynamic balance and weight shifting activities",
        progression: "Eyes open → eyes closed → perturbations"
      },
      {
        name: "Proprioceptive Training",
        sets: "2-3 sets",
        reps: "10-15 reps",
        description: "Joint position sense and kinesthetic awareness",
        equipment: "Wobble boards, stability balls"
      },
      {
        name: "Coordination Training",
        sets: "2-3 sets",
        reps: "10-20 reps", 
        description: "Fine and gross motor coordination activities",
        equipment: "Coordination boards, fine motor tools"
      },
      {
        name: "Postural Re-education",
        sets: "Multiple",
        reps: "Throughout session",
        description: "Postural awareness and correction training",
        position: "All functional positions"
      }
    ]
  },
  {
    code: "97113", 
    description: "Aquatic Therapy with Therapeutic Exercise",
    category: "Therapeutic Procedures",
    specialty: ["Orthopedic", "Neurologic", "Geriatric", "Pediatric"],
    conditions: ["Arthritis", "Joint replacements", "Chronic pain", "Neurologic conditions"],
    protocols: [
      {
        name: "Water Walking",
        sets: "15-30 minutes",
        reps: "Continuous",
        description: "Forward, backward, sideways walking in chest-deep water",
        progression: "Shallow → deep water, add resistance"
      },
      {
        name: "Aquatic Strengthening",
        sets: "2-3 sets",
        reps: "10-15 reps",
        description: "Resistance exercises using water properties",
        equipment: "Water weights, noodles, paddles"
      },
      {
        name: "Range of Motion - Aquatic",
        sets: "2-3 sets",
        reps: "10-15 reps",
        description: "Joint mobility exercises in warm water",
        position: "Standing, floating, supported"
      }
    ]
  },
  {
    code: "97116",
    description: "Gait Training",
    category: "Therapeutic Procedures",
    specialty: ["Neurologic", "Orthopedic", "Geriatric", "Pediatric"],
    conditions: ["CVA", "TBI", "SCI", "Amputations", "Balance disorders", "Post-surgical"],
    protocols: [
      {
        name: "Pre-Gait Activities",
        sets: "2-3 sets",
        reps: "10-15 reps",
        description: "Weight shifting, stepping, marching in place",
        position: "Standing, parallel bars"
      },
      {
        name: "Gait Training - Parallel Bars",
        sets: "Multiple",
        reps: "10-50 feet",
        description: "Protected gait training with upper extremity support",
        progression: "Both hands → one hand → no support"
      },
      {
        name: "Gait Training - Assistive Device",
        sets: "Multiple", 
        reps: "25-100 feet",
        description: "Gait training with walker, crutches, or cane",
        equipment: "Walker, crutches, quad cane, straight cane"
      },
      {
        name: "Stair Training",
        sets: "2-3 sets",
        reps: "5-15 steps",
        description: "Ascending and descending stairs safely",
        progression: "Railings → no railings, step-to → step-over"
      },
      {
        name: "Outdoor/Community Gait",
        sets: "15-30 minutes",
        reps: "Continuous",
        description: "Gait training on uneven surfaces, curbs, ramps",
        equipment: "Various terrain surfaces, curbs, ramps"
      }
    ]
  },
  {
    code: "97150",
    description: "Therapeutic Exercise (Group)",
    category: "Therapeutic Procedures",
    specialty: ["Orthopedic", "Neurologic", "Geriatric", "Cardiopulmonary"],
    conditions: ["Group rehabilitation", "Cardiac rehab", "Pulmonary rehab", "Fall prevention"],
    protocols: [
      {
        name: "Group Strengthening",
        sets: "2-3 sets",
        reps: "10-15 reps",
        description: "Supervised group exercise for strengthening",
        equipment: "Resistance bands, light weights"
      },
      {
        name: "Group Balance/Fall Prevention",
        sets: "Multiple",
        reps: "Throughout session",
        description: "Group balance and fall prevention program",
        equipment: "Balance pads, chairs for safety"
      }
    ]
  },
  {
    code: "97530",
    description: "Therapeutic Activities",
    category: "Therapeutic Procedures",
    specialty: ["Orthopedic", "Neurologic", "Pediatric", "Sports"],
    conditions: ["Work injuries", "ADL deficits", "Sport-specific needs", "Functional deficits"],
    protocols: [
      {
        name: "Work Simulation",
        sets: "Multiple",
        reps: "Task-specific",
        description: "Job-specific movement patterns and tasks",
        equipment: "Work simulation equipment"
      },
      {
        name: "Sport-Specific Training",
        sets: "3-4 sets",
        reps: "Sport-specific",
        description: "Movement patterns specific to sport demands",
        equipment: "Sport-specific equipment, agility ladders, cones"
      },
      {
        name: "ADL Training",
        sets: "Multiple",
        reps: "Task repetition",
        description: "Activities of daily living practice",
        equipment: "ADL simulation equipment, household items"
      },
      {
        name: "Functional Task Training",
        sets: "Multiple",
        reps: "10-20 reps",
        description: "Dynamic activities using multiple body parts",
        progression: "Assisted → independent, simple → complex tasks"
      }
    ]
  },
  {
    code: "97535",
    description: "Self-Care / Home Management Training",
    category: "Therapeutic Procedures",
    specialty: ["Neurologic", "Orthopedic", "Geriatric"],
    conditions: ["CVA", "TBI", "Post-surgical", "Functional decline"],
    protocols: [
      {
        name: "ADL Retraining",
        sets: "Multiple",
        reps: "Task repetition",
        description: "Retraining dressing, grooming, bathing, toileting",
        equipment: "Adaptive equipment as needed"
      },
      {
        name: "Home Safety Assessment & Training",
        sets: "1 session",
        reps: "Throughout",
        description: "Home environment modification and safety training",
        equipment: "Grab bars, raised toilet seat, shower chair"
      },
      {
        name: "Energy Conservation Techniques",
        sets: "Multiple",
        reps: "Throughout session",
        description: "Pacing and energy conservation for daily tasks",
        equipment: "None"
      }
    ]
  },
  {
    code: "97537",
    description: "Community / Work Reintegration Training",
    category: "Therapeutic Procedures",
    specialty: ["Neurologic", "Orthopedic", "Geriatric"],
    conditions: ["CVA", "TBI", "Return to work", "Community reintegration"],
    protocols: [
      {
        name: "Community Mobility Training",
        sets: "Multiple",
        reps: "Task-specific",
        description: "Navigation of community environments, public transit",
        equipment: "Assistive device as needed"
      },
      {
        name: "Work Task Simulation",
        sets: "Multiple",
        reps: "Task-specific",
        description: "Simulation of specific work tasks and demands",
        equipment: "Work simulation tools"
      }
    ]
  },
  {
    code: "97542",
    description: "Wheelchair Management Training",
    category: "Therapeutic Procedures",
    specialty: ["Neurologic", "Spinal Cord", "Geriatric"],
    conditions: ["SCI", "CVA", "Amputations", "Progressive neurological conditions"],
    protocols: [
      {
        name: "Manual Wheelchair Propulsion",
        sets: "Multiple",
        reps: "Throughout session",
        description: "Propulsion technique, turning, maneuvering",
        equipment: "Manual wheelchair"
      },
      {
        name: "Power Wheelchair Operation",
        sets: "Multiple",
        reps: "Throughout session",
        description: "Joystick control, obstacle navigation",
        equipment: "Power wheelchair"
      },
      {
        name: "Wheelchair Pressure Relief",
        sets: "Every 15-30 min",
        reps: "30-60 second holds",
        description: "Pressure relief techniques to prevent skin breakdown",
        equipment: "Wheelchair"
      }
    ]
  },

  // MANUAL THERAPY
  {
    code: "97140",
    description: "Manual Therapy Techniques",
    category: "Manual Therapy",
    specialty: ["Orthopedic", "Sports", "Neurologic"],
    conditions: ["Joint dysfunction", "Muscle tension", "Pain", "Mobility restrictions"],
    protocols: [
      {
        name: "Joint Mobilization",
        sets: "2-3 grades",
        reps: "30-60 seconds",
        description: "Passive joint mobilization techniques",
        position: "Patient-specific positioning"
      },
      {
        name: "Soft Tissue Mobilization",
        sets: "2-3 areas",
        reps: "3-5 minutes per area",
        description: "Manual soft tissue techniques",
        equipment: "Hands, tools as appropriate"
      },
      {
        name: "Myofascial Release",
        sets: "2-3 areas",
        reps: "2-5 minutes per area", 
        description: "Sustained pressure to fascial restrictions",
        equipment: "Hands, foam rollers, tools"
      }
    ]
  },

  // COGNITIVE / FUNCTIONAL
  {
    code: "97129",
    description: "Therapeutic Interventions for Cognitive Function (first 15 min)",
    category: "Therapeutic Procedures",
    specialty: ["Neurologic", "Geriatric", "Pediatric"],
    conditions: ["TBI", "CVA", "Dementia", "Cognitive impairment"],
    protocols: [
      {
        name: "Attention & Concentration Training",
        sets: "Multiple",
        reps: "10-15 min tasks",
        description: "Structured tasks targeting sustained and divided attention",
        equipment: "Cognitive training tools, computer programs"
      },
      {
        name: "Memory Strategies Training",
        sets: "Multiple",
        reps: "Session-long",
        description: "Compensatory memory techniques and external aids",
        equipment: "Memory aids, calendars, whiteboards"
      },
      {
        name: "Executive Function Training",
        sets: "Multiple",
        reps: "Task-specific",
        description: "Planning, problem-solving, and sequencing tasks",
        equipment: "Structured activities, task boards"
      }
    ]
  },
  {
    code: "97130",
    description: "Therapeutic Interventions for Cognitive Function (each add'l 15 min)",
    category: "Therapeutic Procedures",
    specialty: ["Neurologic", "Geriatric", "Pediatric"],
    conditions: ["TBI", "CVA", "Dementia", "Cognitive impairment"],
    protocols: [
      {
        name: "Continued Cognitive Training",
        sets: "Continued",
        reps: "Each additional 15 min",
        description: "Continuation of cognitive intervention beyond initial 15 min",
        equipment: "Cognitive training tools"
      }
    ]
  },

  // WORK HARDENING / CONDITIONING
  {
    code: "97545",
    description: "Work Hardening / Conditioning (first 2 hrs)",
    category: "Work Rehabilitation",
    specialty: ["Orthopedic", "Sports", "Occupational"],
    conditions: ["Work-related injuries", "Return to work", "Musculoskeletal conditions"],
    protocols: [
      {
        name: "Work Hardening Program",
        sets: "Multiple",
        reps: "2-hour session",
        description: "Intensive work simulation and conditioning program",
        equipment: "Work simulation equipment, tools"
      },
      {
        name: "Functional Capacity Building",
        sets: "Multiple",
        reps: "Throughout session",
        description: "Gradually increasing work demands to match job requirements",
        progression: "Low demand → full job demands"
      }
    ]
  },
  {
    code: "97546",
    description: "Work Hardening / Conditioning (each add'l hour)",
    category: "Work Rehabilitation",
    specialty: ["Orthopedic", "Sports", "Occupational"],
    conditions: ["Work-related injuries", "Return to work"],
    protocols: [
      {
        name: "Extended Work Hardening",
        sets: "Continued",
        reps: "Each additional hour",
        description: "Continuation of work hardening beyond initial 2 hours",
        equipment: "Work simulation equipment"
      }
    ]
  },

  // ASSESSMENT / TESTING
  {
    code: "97750",
    description: "Physical Performance Test or Measurement",
    category: "Evaluation and Management",
    specialty: ["All specialties"],
    conditions: ["Functional assessment", "Outcome measurement", "Return to sport/work"],
    protocols: [
      {
        name: "Functional Movement Screen (FMS)",
        sets: "1 session",
        reps: "7 movement patterns",
        description: "Standardized movement screen for functional deficits",
        equipment: "FMS kit"
      },
      {
        name: "Timed Up & Go (TUG)",
        sets: "3 trials",
        reps: "1 each",
        description: "Timed mobility and balance assessment",
        equipment: "Chair, measured path"
      },
      {
        name: "6-Minute Walk Test",
        sets: "1 trial",
        reps: "6 minutes",
        description: "Endurance and functional walking assessment",
        equipment: "Measured course, timer"
      },
      {
        name: "Berg Balance Scale",
        sets: "1 session",
        reps: "14 items",
        description: "Standardized balance assessment",
        equipment: "Chair, step, ruler"
      }
    ]
  },

  // ORTHOTIC / PROSTHETIC
  {
    code: "97760",
    description: "Orthotic Management & Training (initial encounter)",
    category: "Orthotic/Prosthetic",
    specialty: ["Orthopedic", "Neurologic", "Pediatric"],
    conditions: ["Foot drop", "Joint instability", "Post-surgical", "Neurological conditions"],
    protocols: [
      {
        name: "AFO Fit & Gait Training",
        sets: "Multiple",
        reps: "Throughout session",
        description: "Initial fitting and gait training with ankle-foot orthosis",
        equipment: "AFO, appropriate footwear"
      },
      {
        name: "Orthotic Wear Schedule Education",
        sets: "1 session",
        reps: "Education",
        description: "Patient/caregiver education on wear schedule and skin checks",
        equipment: "Handouts, orthotic device"
      }
    ]
  },
  {
    code: "97761",
    description: "Prosthetic Training (initial encounter)",
    category: "Orthotic/Prosthetic",
    specialty: ["Orthopedic", "Vascular"],
    conditions: ["Lower extremity amputation", "Upper extremity amputation"],
    protocols: [
      {
        name: "Prosthetic Donning/Doffing",
        sets: "Multiple",
        reps: "10+ reps",
        description: "Instruction in proper prosthetic application and removal",
        equipment: "Prosthetic limb, liner, sock system"
      },
      {
        name: "Prosthetic Gait Training",
        sets: "Multiple",
        reps: "25-200 feet",
        description: "Gait training with prosthetic device",
        progression: "Parallel bars → assistive device → independent"
      },
      {
        name: "Residual Limb Care & Skin Inspection",
        sets: "1 session",
        reps: "Education",
        description: "Skin care, sock management, and limb hygiene training",
        equipment: "Mirror, skin care products"
      }
    ]
  },
  {
    code: "97763",
    description: "Orthotic/Prosthetic Management (subsequent encounter)",
    category: "Orthotic/Prosthetic",
    specialty: ["Orthopedic", "Neurologic", "Vascular"],
    conditions: ["Ongoing orthotic/prosthetic use"],
    protocols: [
      {
        name: "Orthotic/Prosthetic Gait Refinement",
        sets: "Multiple",
        reps: "Throughout session",
        description: "Advanced gait training and device use optimization",
        progression: "Even surfaces → uneven terrain, stairs, ramps"
      },
      {
        name: "Problem Solving & Device Adjustment",
        sets: "1 session",
        reps: "As needed",
        description: "Address fit issues, skin breakdown, functional limitations",
        equipment: "Device, tools for minor adjustment"
      }
    ]
  },

  // MODALITIES
  {
    code: "97010",
    description: "Hot or Cold Packs",
    category: "Physical Agent Modalities",
    specialty: ["All specialties"],
    conditions: ["Acute injury", "Chronic pain", "Inflammation", "Muscle spasm"],
    protocols: [
      {
        name: "Hot Pack Application",
        sets: "1 application",
        reps: "15-20 minutes",
        description: "Moist heat application for muscle relaxation",
        equipment: "Hydrocollator packs, towels"
      },
      {
        name: "Cold Pack Application", 
        sets: "1 application",
        reps: "10-15 minutes",
        description: "Cold application for acute injury/inflammation",
        equipment: "Ice packs, towels"
      }
    ]
  },
  {
    code: "97012",
    description: "Mechanical Traction",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Neurologic"],
    conditions: ["Disc herniation", "Nerve root compression", "Spinal stenosis"],
    protocols: [
      {
        name: "Cervical Traction",
        sets: "1 session",
        reps: "15-30 minutes",
        description: "Mechanical cervical spine traction",
        equipment: "Cervical traction unit"
      },
      {
        name: "Lumbar Traction",
        sets: "1 session", 
        reps: "15-30 minutes",
        description: "Mechanical lumbar spine traction",
        equipment: "Lumbar traction table/unit"
      }
    ]
  },
  {
    code: "97014",
    description: "Electrical Stimulation (Unattended)",
    category: "Physical Agent Modalities", 
    specialty: ["Orthopedic", "Neurologic", "Sports"],
    conditions: ["Muscle weakness", "Pain", "Edema", "Muscle re-education"],
    protocols: [
      {
        name: "NMES - Strengthening",
        sets: "1 session",
        reps: "15-30 minutes",
        description: "Neuromuscular electrical stimulation for strengthening",
        equipment: "NMES unit, electrodes"
      },
      {
        name: "TENS - Pain Management",
        sets: "1 session",
        reps: "15-30 minutes", 
        description: "Transcutaneous electrical nerve stimulation",
        equipment: "TENS unit, electrodes"
      }
    ]
  },
  {
    code: "97016",
    description: "Vasopneumatic Devices",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Vascular"],
    conditions: ["Lymphedema", "Venous insufficiency", "Post-surgical swelling"],
    protocols: [
      {
        name: "Pneumatic Compression",
        sets: "1 session",
        reps: "30-60 minutes",
        description: "Sequential pneumatic compression therapy",
        equipment: "Pneumatic compression device"
      }
    ]
  },
  {
    code: "97018",
    description: "Paraffin Bath",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Rheumatology"],
    conditions: ["Arthritis", "Joint stiffness", "Hand/foot conditions"],
    protocols: [
      {
        name: "Paraffin Treatment",
        sets: "1 application",
        reps: "15-20 minutes",
        description: "Paraffin wax bath for hands/feet",
        equipment: "Paraffin bath unit"
      }
    ]
  },
  {
    code: "97022",
    description: "Whirlpool",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Wound Care"],
    conditions: ["Wound care", "Range of motion", "Pain relief"],
    protocols: [
      {
        name: "Whirlpool Therapy",
        sets: "1 session",
        reps: "15-30 minutes",
        description: "Hydrotherapy in whirlpool tank",
        equipment: "Whirlpool tank"
      }
    ]
  },
  {
    code: "97026",
    description: "Infrared",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Sports"],
    conditions: ["Muscle tension", "Joint stiffness", "Pain"],
    protocols: [
      {
        name: "Infrared Heat Therapy",
        sets: "1 application",
        reps: "15-20 minutes",
        description: "Infrared heat lamp application",
        equipment: "Infrared heat lamp"
      }
    ]
  },
  {
    code: "97028",
    description: "Ultraviolet",
    category: "Physical Agent Modalities",
    specialty: ["Dermatology", "Wound Care"],
    conditions: ["Skin conditions", "Wound healing"],
    protocols: [
      {
        name: "UV Light Therapy",
        sets: "1 application",
        reps: "Prescribed dosage",
        description: "Ultraviolet light therapy",
        equipment: "UV light unit"
      }
    ]
  },
  {
    code: "97032",
    description: "Electrical Stimulation (Manual)",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Neurologic", "Sports"],
    conditions: ["Pain", "Muscle spasm", "Tissue healing", "Iontophoresis"],
    protocols: [
      {
        name: "Electrical Stimulation - Manual",
        sets: "1 session",
        reps: "15-30 minutes",
        description: "Manually applied electrical stimulation",
        equipment: "E-stim unit with manual controls"
      },
      {
        name: "Iontophoresis",
        sets: "1 session",
        reps: "15-20 minutes",
        description: "Medication delivery via electrical current",
        equipment: "Iontophoresis unit, medication patches"
      }
    ]
  },
  {
    code: "97033",
    description: "Iontophoresis",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Sports"],
    conditions: ["Inflammation", "Calcific deposits", "Localized pain"],
    protocols: [
      {
        name: "Iontophoresis Treatment",
        sets: "1 session",
        reps: "15-20 minutes",
        description: "Transdermal medication delivery",
        equipment: "Iontophoresis unit, medication"
      }
    ]
  },
  {
    code: "97034",
    description: "Contrast Baths",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Sports", "Vascular"],
    conditions: ["Edema", "Circulation problems", "RSD/CRPS"],
    protocols: [
      {
        name: "Contrast Bath Therapy",
        sets: "1 session",
        reps: "20-30 minutes",
        description: "Alternating hot and cold water immersion",
        equipment: "Hot and cold water baths"
      }
    ]
  },
  {
    code: "97035",
    description: "Ultrasound",
    category: "Physical Agent Modalities",
    specialty: ["Orthopedic", "Sports"],
    conditions: ["Soft tissue healing", "Scar tissue", "Joint contractures"],
    protocols: [
      {
        name: "Therapeutic Ultrasound",
        sets: "1 application",
        reps: "5-10 minutes",
        description: "Deep heating via ultrasound waves",
        equipment: "Ultrasound unit, coupling gel"
      },
      {
        name: "Phonophoresis",
        sets: "1 application", 
        reps: "5-10 minutes",
        description: "Medication delivery via ultrasound",
        equipment: "Ultrasound unit, medicated gel"
      }
    ]
  },
  {
    code: "97036",
    description: "Hubbard Tank",
    category: "Physical Agent Modalities",
    specialty: ["Burn Care", "Wound Care", "Neurologic"],
    conditions: ["Burns", "Large wounds", "Mobility restrictions"],
    protocols: [
      {
        name: "Hubbard Tank Therapy",
        sets: "1 session",
        reps: "20-45 minutes",
        description: "Full body hydrotherapy treatment",
        equipment: "Hubbard tank"
      }
    ]
  },

  // EVALUATION AND MANAGEMENT
  {
    code: "97161",
    description: "PT Evaluation - Low Complexity",
    category: "Evaluation and Management",
    specialty: ["All specialties"],
    conditions: ["Simple conditions", "Single body region"],
    protocols: [
      {
        name: "Basic Assessment",
        sets: "1 session",
        reps: "30-45 minutes",
        description: "History, examination, plan development",
        equipment: "Assessment tools, goniometer"
      }
    ]
  },
  {
    code: "97162", 
    description: "PT Evaluation - Moderate Complexity",
    category: "Evaluation and Management",
    specialty: ["All specialties"],
    conditions: ["Multiple impairments", "Moderate complexity"],
    protocols: [
      {
        name: "Comprehensive Assessment",
        sets: "1 session",
        reps: "45-60 minutes",
        description: "Detailed history, examination, complex planning",
        equipment: "Multiple assessment tools"
      }
    ]
  },
  {
    code: "97163",
    description: "PT Evaluation - High Complexity", 
    category: "Evaluation and Management",
    specialty: ["All specialties"],
    conditions: ["Complex conditions", "Multiple body regions", "Comorbidities"],
    protocols: [
      {
        name: "Complex Assessment",
        sets: "1 session",
        reps: "60-90 minutes",
        description: "Extensive evaluation of complex conditions",
        equipment: "Comprehensive assessment battery"
      }
    ]
  },
  {
    code: "97164",
    description: "PT Re-evaluation",
    category: "Evaluation and Management", 
    specialty: ["All specialties"],
    conditions: ["Progress assessment", "Plan modification"],
    protocols: [
      {
        name: "Progress Re-assessment",
        sets: "1 session",
        reps: "20-30 minutes",
        description: "Re-evaluation of patient progress and plan",
        equipment: "Assessment tools"
      }
    ]
  }
];

// COMPREHENSIVE ICD-10 CODES FOR PHYSICAL THERAPY
export const COMPREHENSIVE_ICD10_CODES: ICD10Code[] = [
  // NEUROLOGICAL CONDITIONS
  {
    code: "I69.351",
    description: "Hemiplegia and hemiparesis following cerebral infarction affecting right dominant side",
    category: "Cerebrovascular diseases",
    specialty: ["Neurologic"],
    commonAssessments: ["Berg Balance Scale", "Fugl-Meyer", "NIHSS", "Barthel Index"],
    typicalGoals: ["Improve mobility", "Increase strength", "Enhance balance", "ADL independence"]
  },
  {
    code: "I69.352", 
    description: "Hemiplegia and hemiparesis following cerebral infarction affecting left dominant side",
    category: "Cerebrovascular diseases",
    specialty: ["Neurologic"],
    commonAssessments: ["Berg Balance Scale", "Fugl-Meyer", "NIHSS", "Barthel Index"],
    typicalGoals: ["Improve mobility", "Increase strength", "Enhance balance", "ADL independence"]
  },
  {
    code: "G81.90",
    description: "Hemiplegia, unspecified affecting unspecified side",
    category: "Diseases of the nervous system",
    specialty: ["Neurologic"],
    commonAssessments: ["Berg Balance Scale", "Fugl-Meyer", "Motor Assessment Scale"],
    typicalGoals: ["Motor recovery", "Functional mobility", "Balance training"]
  },
  {
    code: "G82.20",
    description: "Paraplegia, unspecified",
    category: "Diseases of the nervous system", 
    specialty: ["Neurologic", "Spinal Cord"],
    commonAssessments: ["ASIA Scale", "Spinal Cord Independence Measure", "Walking Index"],
    typicalGoals: ["Wheelchair mobility", "Transfer training", "Respiratory function"]
  },
  {
    code: "G82.50",
    description: "Quadriplegia, unspecified",
    category: "Diseases of the nervous system",
    specialty: ["Neurologic", "Spinal Cord"],
    commonAssessments: ["ASIA Scale", "FIM", "Capabilities of Upper Extremity"],
    typicalGoals: ["Respiratory management", "Positioning", "Assistive technology"]
  },
  {
    code: "G20",
    description: "Parkinson's disease",
    category: "Diseases of the nervous system",
    specialty: ["Neurologic", "Geriatric"],
    commonAssessments: ["UPDRS", "Berg Balance Scale", "Timed Up and Go", "PDQ-39"],
    typicalGoals: ["Maintain mobility", "Improve balance", "Reduce falls", "Exercise tolerance"]
  },
  {
    code: "G35",
    description: "Multiple sclerosis",
    category: "Diseases of the nervous system",
    specialty: ["Neurologic"],
    commonAssessments: ["EDSS", "Multiple Sclerosis Functional Composite", "Fatigue Severity Scale"],
    typicalGoals: ["Energy conservation", "Mobility maintenance", "Symptom management"]
  },
  {
    code: "S06.9X0A",
    description: "Unspecified intracranial injury without loss of consciousness, initial encounter",
    category: "Injury, poisoning and certain other consequences of external causes",
    specialty: ["Neurologic", "Acute Care"],
    commonAssessments: ["Glasgow Coma Scale", "Rancho Los Amigos Scale", "Cognitive Assessment"],
    typicalGoals: ["Cognitive recovery", "Motor function", "Safety awareness"]
  },

  // ORTHOPEDIC CONDITIONS - SPINE
  {
    code: "M54.5",
    description: "Low back pain",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic", "Sports"],
    commonAssessments: ["Oswestry Disability Index", "Roland-Morris", "Numeric Pain Scale"],
    typicalGoals: ["Pain reduction", "Improve function", "Return to work", "Prevent recurrence"]
  },
  {
    code: "M54.2",
    description: "Cervicalgia",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic"],
    commonAssessments: ["Neck Disability Index", "Cervical Range of Motion", "Headache Impact Test"],
    typicalGoals: ["Pain relief", "Improve neck mobility", "Postural correction"]
  },
  {
    code: "M51.26",
    description: "Other intervertebral disc displacement, lumbar region",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic"],
    commonAssessments: ["Straight Leg Raise", "Neurological Screen", "Functional Movement"],
    typicalGoals: ["Reduce nerve irritation", "Improve mobility", "Strengthen core"]
  },
  {
    code: "M48.06",
    description: "Spinal stenosis, lumbar region",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic", "Geriatric"],
    commonAssessments: ["Walking tolerance", "Neurogenic claudication assessment"],
    typicalGoals: ["Improve walking tolerance", "Pain management", "Functional mobility"]
  },

  // ORTHOPEDIC CONDITIONS - SHOULDER
  {
    code: "M75.30",
    description: "Calcific tendinitis of shoulder, unspecified shoulder",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic", "Sports"],
    commonAssessments: ["DASH", "Shoulder Pain and Disability Index", "Range of Motion"],
    typicalGoals: ["Pain reduction", "Restore ROM", "Improve function"]
  },
  {
    code: "M75.100",
    description: "Unspecified rotator cuff tear or rupture of unspecified shoulder, not specified as traumatic",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic", "Sports"],
    commonAssessments: ["Constant-Murley Score", "ASES", "Rotator Cuff Strength Testing"],
    typicalGoals: ["Strengthen rotator cuff", "Improve function", "Pain management"]
  },
  {
    code: "M25.511",
    description: "Pain in right shoulder",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic"],
    commonAssessments: ["Shoulder impingement tests", "Range of motion", "Strength testing"],
    typicalGoals: ["Pain relief", "Restore normal movement", "Prevent recurrence"]
  },

  // ORTHOPEDIC CONDITIONS - KNEE
  {
    code: "M17.11",
    description: "Unilateral primary osteoarthritis, right knee",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic", "Geriatric"],
    commonAssessments: ["WOMAC", "Knee Injury and Osteoarthritis Outcome Score", "6-Minute Walk"],
    typicalGoals: ["Pain management", "Improve mobility", "Strengthen quadriceps", "Delay surgery"]
  },
  {
    code: "S83.511A",
    description: "Sprain of anterior cruciate ligament of right knee, initial encounter",
    category: "Injury, poisoning and certain other consequences of external causes",
    specialty: ["Sports", "Orthopedic"],
    commonAssessments: ["Lachman test", "Pivot shift", "IKDC", "Lysholm Score"],
    typicalGoals: ["Restore stability", "Return to sport", "Prevent re-injury"]
  },
  {
    code: "M23.201",
    description: "Derangement of unspecified meniscus due to old tear or injury, right knee",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic", "Sports"],
    commonAssessments: ["McMurray test", "Thessaly test", "Functional hop tests"],
    typicalGoals: ["Reduce mechanical symptoms", "Improve function", "Return to activities"]
  },

  // ORTHOPEDIC CONDITIONS - HIP
  {
    code: "M16.11",
    description: "Unilateral primary osteoarthritis, right hip",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic", "Geriatric"],
    commonAssessments: ["Harris Hip Score", "WOMAC", "Hip Range of Motion"],
    typicalGoals: ["Pain management", "Maintain mobility", "Strengthen hip muscles"]
  },
  {
    code: "Z96.641",
    description: "Presence of right artificial hip joint",
    category: "Factors influencing health status and contact with health services",
    specialty: ["Orthopedic", "Geriatric"],
    commonAssessments: ["Harris Hip Score", "Functional mobility assessment", "Gait analysis"],
    typicalGoals: ["Restore function", "Improve mobility", "Prevent complications"]
  },

  // ORTHOPEDIC CONDITIONS - ANKLE/FOOT
  {
    code: "S93.401A",
    description: "Sprain of unspecified ligament of right ankle, initial encounter",
    category: "Injury, poisoning and certain other consequences of external causes",
    specialty: ["Sports", "Orthopedic"],
    commonAssessments: ["Anterior drawer test", "Talar tilt test", "Functional ankle tests"],
    typicalGoals: ["Restore stability", "Return to activity", "Prevent chronic instability"]
  },
  {
    code: "M72.2",
    description: "Plantar fascial fibromatosis",
    category: "Diseases of the musculoskeletal system",
    specialty: ["Orthopedic", "Sports"],
    commonAssessments: ["Foot Function Index", "Pain assessment", "Biomechanical analysis"],
    typicalGoals: ["Pain reduction", "Improve function", "Address biomechanics"]
  },

  // GENERAL MUSCULOSKELETAL
  {
    code: "R53.1",
    description: "Weakness",
    category: "Symptoms, signs and abnormal clinical and laboratory findings",
    specialty: ["Neurologic", "Geriatric", "General"],
    commonAssessments: ["Manual muscle testing", "Functional strength tests", "Endurance measures"],
    typicalGoals: ["Increase strength", "Improve endurance", "Enhance function"]
  },
  {
    code: "R26.2",
    description: "Difficulty in walking, not elsewhere classified",
    category: "Symptoms, signs and abnormal clinical and laboratory findings",
    specialty: ["Neurologic", "Geriatric", "Orthopedic"],
    commonAssessments: ["Gait analysis", "Timed Up and Go", "10-meter walk test"],
    typicalGoals: ["Improve gait pattern", "Increase walking speed", "Enhance safety"]
  },
  {
    code: "R26.81",
    description: "Unsteadiness on feet",
    category: "Symptoms, signs and abnormal clinical and laboratory findings",
    specialty: ["Neurologic", "Geriatric"],
    commonAssessments: ["Berg Balance Scale", "Tinetti Balance Assessment", "Fall risk assessment"],
    typicalGoals: ["Improve balance", "Reduce fall risk", "Increase confidence"]
  },
  {
    code: "Z87.891",
    description: "Personal history of nicotine dependence",
    category: "Factors influencing health status and contact with health services",
    specialty: ["Cardiopulmonary", "General"],
    commonAssessments: ["Pulmonary function tests", "Exercise tolerance", "Smoking cessation readiness"],
    typicalGoals: ["Improve respiratory function", "Increase exercise tolerance", "Support cessation"]
  },

  // PEDIATRIC CONDITIONS
  {
    code: "G80.1",
    description: "Spastic diplegic cerebral palsy",
    category: "Diseases of the nervous system",
    specialty: ["Pediatric", "Neurologic"],
    commonAssessments: ["GMFCS", "PEDI", "Gross Motor Function Measure"],
    typicalGoals: ["Improve gross motor skills", "Enhance mobility", "Prevent contractures"]
  },
  {
    code: "G80.0",
    description: "Spastic quadriplegic cerebral palsy",
    category: "Diseases of the nervous system",
    specialty: ["Pediatric", "Neurologic"],
    commonAssessments: ["GMFCS", "PEDI", "Quality of Upper Extremity Skills Test"],
    typicalGoals: ["Positioning", "Prevent deformity", "Maximize function"]
  },
  {
    code: "Q66.89",
    description: "Other specified congenital deformities of feet",
    category: "Congenital malformations, deformations and chromosomal abnormalities",
    specialty: ["Pediatric", "Orthopedic"],
    commonAssessments: ["Foot posture assessment", "Gait analysis", "Range of motion"],
    typicalGoals: ["Improve foot alignment", "Enhance mobility", "Prevent complications"]
  },

  // CARDIOPULMONARY CONDITIONS
  {
    code: "I50.9",
    description: "Heart failure, unspecified",
    category: "Diseases of the circulatory system",
    specialty: ["Cardiopulmonary", "Geriatric"],
    commonAssessments: ["6-minute walk test", "Borg Scale", "Functional capacity assessment"],
    typicalGoals: ["Improve exercise tolerance", "Enhance quality of life", "Reduce symptoms"]
  },
  {
    code: "J44.1",
    description: "Chronic obstructive pulmonary disease with acute exacerbation",
    category: "Diseases of the respiratory system",
    specialty: ["Cardiopulmonary"],
    commonAssessments: ["Pulmonary function tests", "Dyspnea scales", "Exercise tolerance"],
    typicalGoals: ["Improve breathing efficiency", "Increase exercise capacity", "Energy conservation"]
  }
];

// SPECIALIZED ASSESSMENT TOOLS BY CONDITION
export const ASSESSMENT_TOOLS = {
  neurologic: [
    "Berg Balance Scale",
    "Fugl-Meyer Assessment", 
    "Barthel Index",
    "Functional Independence Measure (FIM)",
    "National Institutes of Health Stroke Scale (NIHSS)",
    "Modified Rankin Scale",
    "Ashworth Scale",
    "Tardieu Scale",
    "Timed Up and Go Test",
    "10-Meter Walk Test",
    "6-Minute Walk Test"
  ],
  orthopedic: [
    "Oswestry Disability Index",
    "Neck Disability Index", 
    "DASH (Disabilities of Arm, Shoulder, Hand)",
    "WOMAC (Western Ontario McMaster)",
    "Knee Injury and Osteoarthritis Outcome Score (KOOS)",
    "Harris Hip Score",
    "Constant-Murley Shoulder Score",
    "American Shoulder and Elbow Surgeons (ASES) Score",
    "Foot Function Index",
    "Lower Extremity Functional Scale"
  ],
  pediatric: [
    "Gross Motor Function Classification System (GMFCS)",
    "Gross Motor Function Measure (GMFM)",
    "Pediatric Evaluation of Disability Inventory (PEDI)",
    "Bruininks-Oseretsky Test of Motor Proficiency",
    "Peabody Developmental Motor Scales",
    "Alberta Infant Motor Scale",
    "Test of Infant Motor Performance (TIMP)"
  ],
  cardiopulmonary: [
    "6-Minute Walk Test",
    "Borg Rating of Perceived Exertion",
    "Duke Activity Status Index",
    "Minnesota Living with Heart Failure Questionnaire",
    "St. George's Respiratory Questionnaire",
    "Chronic Respiratory Disease Questionnaire"
  ]
};

// GOAL TEMPLATES BY SPECIALTY AND CONDITION
export const COMPREHENSIVE_GOAL_TEMPLATES = {
  neurologic: [
    {
      category: "Mobility",
      template: "Patient will improve gait speed from {current} m/s to {target} m/s over {distance} meters with {assistive_device} in {timeframe}",
      measurable: true
    },
    {
      category: "Balance", 
      template: "Patient will improve Berg Balance Scale score from {current} to {target} points in {timeframe}",
      measurable: true
    },
    {
      category: "Transfers",
      template: "Patient will perform {transfer_type} with {assistance_level} in {timeframe}",
      measurable: true
    },
    {
      category: "Strength",
      template: "Patient will increase {muscle_group} strength from {current}/5 to {target}/5 MMT grade in {timeframe}",
      measurable: true
    }
  ],
  orthopedic: [
    {
      category: "Pain",
      template: "Patient will decrease pain from {current}/10 to {target}/10 on numeric pain scale during {activity} in {timeframe}",
      measurable: true
    },
    {
      category: "Range of Motion",
      template: "Patient will increase {joint} {motion} from {current}° to {target}° in {timeframe}",
      measurable: true
    },
    {
      category: "Function",
      template: "Patient will improve {outcome_measure} score from {current} to {target} in {timeframe}",
      measurable: true
    },
    {
      category: "Return to Activity",
      template: "Patient will return to {activity} at {level} level in {timeframe}",
      measurable: true
    }
  ],
  pediatric: [
    {
      category: "Gross Motor",
      template: "Child will achieve {gross_motor_skill} independently in {timeframe}",
      measurable: true
    },
    {
      category: "Developmental",
      template: "Child will improve GMFM-88 score by {points} points in {timeframe}",
      measurable: true
    },
    {
      category: "Functional Mobility",
      template: "Child will ambulate {distance} with {assistive_device} and {assistance_level} in {timeframe}",
      measurable: true
    }
  ],
  cardiopulmonary: [
    {
      category: "Endurance",
      template: "Patient will increase 6-minute walk distance from {current} meters to {target} meters in {timeframe}",
      measurable: true
    },
    {
      category: "Exercise Tolerance",
      template: "Patient will exercise at {intensity} for {duration} minutes with RPE ≤ {target} in {timeframe}",
      measurable: true
    }
  ]
};
