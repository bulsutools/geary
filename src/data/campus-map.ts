export type LocationCategory =
  | 'administration'
  | 'student-services'
  | 'academic'
  | 'library'
  | 'food-housing'
  | 'sports-events';

export const LOCATION_CATEGORY_LABELS: Record<LocationCategory, string> = {
  administration: 'Admin & Records',
  'student-services': 'Student Services',
  academic: 'Colleges & Labs',
  library: 'Libraries',
  'food-housing': 'Food & Housing',
  'sports-events': 'Sports & Events',
};

export interface CampusLocation {
  id: string;
  name: string;
  floor?: string;
  category: LocationCategory;
  keywords?: string[];
  notes?: string;
  articleSlug?: string;
}

export interface CampusBuilding {
  id: string;
  name: string;
  shortLabel: string;
  floors?: number | null;
  svgPath: string;
  center: { x: number; y: number };
  summary: string;
  locations: CampusLocation[];
}

export interface CampusPark {
  name: string;
  svgPath: string;
  center: { x: number; y: number };
}

export interface CampusGate {
  name: string;
  x: number;
  y: number;
}

export const CAMPUS_MAP_VIEWBOX = "0 0 1000 850";
export const CAMPUS_PERIMETER_PATH = "M175.1,411.1 L269.0,324.3 L368.0,235.0 L525.2,408.3 L704.6,257.8 L545.3,79.2 L575.1,50.0 L612.5,84.5 L618.5,93.2 L779.9,280.6 L785.9,286.6 L940.9,456.3 L904.2,486.9 L872.6,454.4 L804.5,509.0 L704.9,593.4 L680.1,559.5 L643.0,573.5 L555.7,628.5 L489.8,670.9 L440.6,702.1 L423.7,720.2 L397.3,744.3 L344.6,795.1 L330.3,800.0 L272.1,733.1 L160.9,612.5 L91.6,669.3 L70.1,637.8 L119.9,601.3 L127.0,595.0 L59.1,515.2 L175.1,411.1 Z";
export const CAMPUS_PATHS: readonly string[] = [
  "M-18.0,582.0 L58.0,673.6 L196.0,832.0",
  "M58.0,673.6 L80.9,653.6",
  "M80.9,653.6 L145.4,603.8 L207.8,547.6",
  "M207.8,547.6 L271.0,490.7 L363.9,407.1 L371.3,400.4 L313.7,336.5",
  "M207.8,547.6 L318.2,670.2 L381.4,613.4 L271.0,490.7",
  "M268.0,614.5 L292.8,592.2",
  "M307.2,579.2 L331.2,557.6",
  "M239.8,518.8 L291.3,576.1",
  "M308.7,595.4 L350.2,641.5",
  "M313.0,585.7 L312.0,590.7 L309.2,594.9 L305.0,597.7 L300.0,598.7 L295.0,597.7 L290.8,594.9 L288.0,590.7 L287.0,585.7 L288.0,580.7 L290.8,576.5 L295.0,573.7 L300.0,572.7 L305.0,573.7 L309.2,576.5 L312.0,580.7 L313.0,585.7",
  "M381.4,613.4 L474.3,529.7",
  "M381.4,613.4 L447.6,686.9",
  "M425.5,662.4 L326.7,751.4",
  "M363.9,407.1 L388.6,434.6 L441.5,493.3 L503.0,561.7 L545.9,609.2",
  "M545.9,609.2 L555.7,628.5",
  "M388.6,434.6 L473.3,358.3 L526.2,417.0",
  "M441.5,493.3 L533.6,410.3 L595.2,478.7 L617.9,504.0 L794.1,345.4",
  "M503.0,561.7 L595.2,478.7",
  "M560.2,64.6 L588.0,116.5 L794.1,345.4 L890.4,452.4 L922.6,471.6"
];
export const CAMPUS_PARKS: readonly CampusPark[] = [
  {
    "name": "Heroes Park",
    "svgPath": "M470.3,483.5 L535.7,424.6 L582.6,476.6 L517.2,535.5 Z",
    "center": {
      "x": 526.4,
      "y": 480.1
    }
  },
  {
    "name": "Rizal Park",
    "svgPath": "M228.5,558.6 L280.5,511.8 L371.5,612.8 L319.5,659.7 Z",
    "center": {
      "x": 300.0,
      "y": 585.7
    }
  }
];
export const CAMPUS_GATES: readonly CampusGate[] = [
  {
    "name": "Gate 4",
    "x": 560.2,
    "y": 64.6
  },
  {
    "name": "Gate 3",
    "x": 922.6,
    "y": 471.6
  },
  {
    "name": "Gate 2",
    "x": 555.7,
    "y": 628.5
  },
  {
    "name": "Gate 1",
    "x": 80.9,
    "y": 653.6
  }
];
export const CAMPUS_BUILDINGS: readonly CampusBuilding[] = [
  {
    "id": "federizo-hall",
    "name": "Federizo Hall",
    "shortLabel": "Federizo Hall",
    "floors": 3,
    "svgPath": "M543.7,406.6 L701.3,264.8 L774.9,346.5 L754.1,365.2 L699.2,304.3 L583.3,408.7 L627.4,457.7 L606.6,476.5 Z",
    "center": {
      "x": 631.9,
      "y": 346.1
    },
    "summary": "Historic three-storey academic building near Bulacan Heroes Park housing Graduate School, CAL, and CS.",
    "locations": [
      {
        "id": "grad-school",
        "name": "Graduate School",
        "category": "academic",
        "keywords": [
          "Masters",
          "Doctoral",
          "GSAT"
        ]
      },
      {
        "id": "cal",
        "name": "College of Arts & Letters (CAL)",
        "category": "academic",
        "keywords": [
          "CAL",
          "Arts",
          "Letters",
          "Federizo Hall"
        ]
      },
      {
        "id": "cs",
        "name": "College of Science (CS)",
        "category": "academic",
        "keywords": [
          "CS",
          "Science",
          "Federizo Hall"
        ]
      }
    ]
  },
  {
    "id": "alvarado-hall",
    "name": "Alvarado Hall",
    "shortLabel": "Alvarado Hall",
    "floors": 4,
    "svgPath": "M67.9,514.8 L179.4,414.4 L244.9,487.2 L133.5,587.6 Z",
    "center": {
      "x": 156.4,
      "y": 501.0
    },
    "summary": "Academic and administrative building on the MacArthur Highway (west) side housing the College of Industrial Technology, Office of the Chief Administrative Officer for Administration, and HRMO.",
    "locations": [
      {
        "id": "cit",
        "name": "College of Industrial Technology (CIT)",
        "floor": "2nd Floor",
        "category": "academic",
        "keywords": [
          "BIT",
          "Industrial Technology",
          "TVL",
          "NC II",
          "CIT"
        ]
      },
      {
        "id": "cao-admin",
        "name": "Office of the Chief Administrative Officer for Administration",
        "floor": "4th Floor",
        "category": "administration",
        "keywords": [
          "CAO",
          "Chief Administrative Officer",
          "Administration"
        ],
        "notes": "VoIP (044) 919-7800 local 1031"
      },
      {
        "id": "hrmo",
        "name": "Human Resource Management Office (HRMO)",
        "floor": "4th Floor",
        "category": "administration",
        "keywords": [
          "HR",
          "HRMO",
          "HRMDO",
          "Admin",
          "Personnel"
        ],
        "notes": "VoIP (044) 919-7800 local 1033"
      }
    ]
  },
  {
    "id": "college-of-law",
    "name": "Marcelo H. del Pilar (College of Law)",
    "shortLabel": "College of Law",
    "floors": 2,
    "svgPath": "M293.9,499.7 L320.6,475.6 L403.6,567.8 L376.8,591.9 L346.1,557.7 L342.3,561.0 L327.6,544.7 L331.3,541.3 Z",
    "center": {
      "x": 348.7,
      "y": 533.8
    },
    "summary": "Marcelo H. del Pilar College of Law building; the University Admissions Office (UAO) sits right beside this building.",
    "locations": [
      {
        "id": "law",
        "name": "College of Law (Marcelo H. del Pilar)",
        "category": "academic",
        "keywords": [
          "Law",
          "Juris Doctor"
        ]
      },
      {
        "id": "uao",
        "name": "University Admissions Office (UAO)",
        "floor": "Adjacent Annex (Beside College of Law)",
        "category": "student-services",
        "keywords": [
          "Admission",
          "ATBulSU",
          "BSUAT",
          "Shifter",
          "Transferee",
          "Orientation"
        ],
        "notes": "VoIP (044) 919-7800 local 1087 | admissions@bulsu.edu.ph",
        "articleSlug": "how-to-apply-to-bulsu"
      }
    ]
  },
  {
    "id": "activity-center",
    "name": "Activity Center",
    "shortLabel": "Activity Center",
    "floors": null,
    "svgPath": "M170.5,610.8 L218.1,568.0 L305.0,664.6 L257.5,707.4 Z",
    "center": {
      "x": 237.8,
      "y": 637.7
    },
    "summary": "Covered multi-sport activity center on Main Campus.",
    "locations": []
  },
  {
    "id": "carpio-hall",
    "name": "Carpio Hall",
    "shortLabel": "Carpio Hall",
    "floors": null,
    "svgPath": "M329.5,467.6 L354.8,444.9 L445.8,545.9 L420.5,568.7 Z",
    "center": {
      "x": 387.7,
      "y": 506.8
    },
    "summary": "Campus hall housing the Laboratory High School.",
    "locations": [
      {
        "id": "lhs",
        "name": "Laboratory High School",
        "category": "academic",
        "keywords": [
          "LHS",
          "Laboratory High School",
          "High School",
          "Carpio Hall"
        ]
      }
    ]
  },
  {
    "id": "chtm-building",
    "name": "CHTM Building",
    "shortLabel": "CHTM Building",
    "floors": null,
    "svgPath": "M273.2,381.1 L311.8,346.3 L335.9,373.1 L321.0,386.4 L339.8,407.2 L316.0,428.7 Z",
    "center": {
      "x": 305.9,
      "y": 378.6
    },
    "summary": "College of Hospitality and Tourism Management building near the E-Library.",
    "locations": [
      {
        "id": "chtm",
        "name": "College of Hospitality and Tourism Management (CHTM)",
        "category": "academic",
        "keywords": [
          "CHTM",
          "Hospitality",
          "Tourism",
          "Home Economics",
          "CHE"
        ]
      }
    ]
  },
  {
    "id": "bulsu-hostel",
    "name": "BulSU University Hostel",
    "shortLabel": "Hostel",
    "floors": null,
    "svgPath": "M277.3,328.9 L366.5,248.6 L383.9,267.9 L294.7,348.2 Z",
    "center": {
      "x": 330.6,
      "y": 298.4
    },
    "summary": "BulSU University Hostel on Main Campus.",
    "locations": []
  },
  {
    "id": "e-library",
    "name": "BulSU E-Library",
    "shortLabel": "E-Library",
    "floors": 7,
    "svgPath": "M329.1,341.5 L395.9,281.3 L441.4,331.9 L426.6,345.2 L450.7,372.0 L398.6,418.8 Z",
    "center": {
      "x": 392.4,
      "y": 349.1
    },
    "summary": "Seven-storey University Library hub offering print collections, OPAC terminals, online databases, and research help.",
    "locations": [
      {
        "id": "main-library",
        "name": "Office of the University Library",
        "category": "library",
        "keywords": [
          "Library",
          "BulSU E-Library",
          "Main Library",
          "Circulation",
          "Reserve",
          "Fiction",
          "Theses",
          "OPAC",
          "Periodicals",
          "Study"
        ],
        "articleSlug": "bulsu-library-guide"
      },
      {
        "id": "learning-commons",
        "name": "Learning Commons",
        "floor": "Ground Floor",
        "category": "library",
        "keywords": [
          "Library",
          "Study",
          "Reading Area",
          "Discussion",
          "E-Library"
        ],
        "articleSlug": "bulsu-library-guide"
      },
      {
        "id": "smart-device-zone",
        "name": "Smart Device Zone",
        "floor": "6th Floor",
        "category": "library",
        "keywords": [
          "Library",
          "Computer",
          "Laptop",
          "Research",
          "Database",
          "E-Library"
        ],
        "articleSlug": "bulsu-library-guide"
      }
    ]
  },
  {
    "id": "flores-hall",
    "name": "Flores Hall",
    "shortLabel": "Flores Hall",
    "floors": 2,
    "svgPath": "M665.8,536.2 L723.8,484.0 L693.0,449.8 L713.8,431.1 L762.0,484.6 L683.2,555.5 Z",
    "center": {
      "x": 726.7,
      "y": 496.2
    },
    "summary": "Main administration building facing Bulacan Heroes Park housing Registrar, Cashier, Accounting, Budget, Health Services, Records Management, and OSAS.",
    "locations": [
      {
        "id": "registrar",
        "name": "Office of the University Registrar",
        "floor": "Ground Floor",
        "category": "administration",
        "keywords": [
          "TOR",
          "Transcript",
          "COR",
          "COG",
          "Clearance",
          "LOA",
          "Readmission",
          "Dropping",
          "Graduation",
          "Diploma",
          "Transfer Credentials"
        ],
        "notes": "VoIP (044) 919-7800 local 1001",
        "articleSlug": "how-to-request-transcript-and-certificates"
      },
      {
        "id": "cashier",
        "name": "Cashier's Office",
        "floor": "Ground Floor",
        "category": "administration",
        "keywords": [
          "Payment",
          "Receipt",
          "ID Replacement Fee",
          "BSUAT Fee",
          "Tuition"
        ],
        "notes": "VoIP (044) 919-7800 local 1115 | cashier@bulsu.edu.ph",
        "articleSlug": "how-to-replace-a-lost-student-id"
      },
      {
        "id": "accounting",
        "name": "Accounting Office",
        "floor": "Ground Floor",
        "category": "administration",
        "keywords": [
          "Accounting",
          "Assessment",
          "Billing",
          "Clearance",
          "Refund"
        ],
        "notes": "VoIP (044) 919-7800 local 1006"
      },
      {
        "id": "budget",
        "name": "Budget Office",
        "floor": "Ground Floor",
        "category": "administration",
        "keywords": [
          "Budget",
          "Finance",
          "Allocation"
        ],
        "notes": "VoIP (044) 919-7800 local 1010"
      },
      {
        "id": "clinic",
        "name": "University Health Services",
        "floor": "Ground Floor",
        "category": "student-services",
        "keywords": [
          "Clinic",
          "Medical",
          "Dental",
          "Health",
          "Medical Certificate",
          "First Aid"
        ],
        "notes": "VoIP (044) 919-7800 local 1013",
        "articleSlug": "bulsu-medical-and-health-services-guide"
      },
      {
        "id": "records-management",
        "name": "Records Management Office",
        "floor": "2nd Floor",
        "category": "administration",
        "keywords": [
          "Records",
          "Archive",
          "Certification",
          "Documents"
        ],
        "notes": "VoIP (044) 919-7800 local 1032"
      },
      {
        "id": "osas-main",
        "name": "Office of the Student Affairs and Services (OSAS) – Main Campus",
        "floor": "Office No. 5, 2nd Floor",
        "category": "student-services",
        "keywords": [
          "OSAS",
          "Student Affairs",
          "Student Services",
          "Clearance",
          "Main Campus"
        ],
        "notes": "VoIP (044) 919-7800 local 1024"
      },
      {
        "id": "osas-external",
        "name": "Office of the Student Affairs and Services (OSAS) – External Campus",
        "floor": "2nd Floor",
        "category": "student-services",
        "keywords": [
          "OSAS",
          "Student Affairs",
          "External Campus"
        ],
        "notes": "VoIP (044) 919-7800 local 1025"
      }
    ]
  },
  {
    "id": "mendoza-hall",
    "name": "Mendoza Hall",
    "shortLabel": "Mendoza Hall",
    "floors": 2,
    "svgPath": "M597.3,113.4 L615.2,97.4 L779.8,280.2 L761.9,296.3 Z",
    "center": {
      "x": 688.6,
      "y": 196.8
    },
    "summary": "Two-storey academic building on the north campus wing housing the College of Social Sciences and Philosophy.",
    "locations": [
      {
        "id": "cssp",
        "name": "College of Social Sciences and Philosophy (CSSP)",
        "category": "academic",
        "keywords": [
          "Mendoza Hall",
          "CSSP",
          "Psychology",
          "Social Sciences",
          "Philosophy"
        ]
      }
    ]
  },
  {
    "id": "valencia-hall",
    "name": "Valencia Hall",
    "shortLabel": "Valencia Hall",
    "floors": null,
    "svgPath": "M732.1,433.5 L778.2,392.0 L815.6,433.6 L769.6,475.1 Z",
    "center": {
      "x": 773.9,
      "y": 433.5
    },
    "summary": "Multi-purpose university auditorium on Main Campus.",
    "locations": []
  },
  {
    "id": "pimentel-hall",
    "name": "Pimentel Hall",
    "shortLabel": "Pimentel Hall",
    "floors": 4,
    "svgPath": "M271.0,719.4 L291.8,700.7 L309.2,720.0 L393.9,643.8 L412.7,664.6 L307.2,759.6 Z",
    "center": {
      "x": 352.8,
      "y": 699.7
    },
    "summary": "Academic Building housing the College of Information and Communications Technology (CICT) and the College of Nursing (CON).",
    "locations": [
      {
        "id": "cict-dean",
        "name": "College of Information & Communications Technology (CICT)",
        "floor": "3rd Floor (Dean's Office)",
        "category": "academic",
        "keywords": [
          "IT",
          "BSIT",
          "BLIS",
          "Computer",
          "CICT Dean"
        ],
        "notes": "VoIP (044) 919-7800 local 1102 | officeofthedean.CICT@bulsu.edu.ph"
      },
      {
        "id": "con",
        "name": "College of Nursing (CON)",
        "category": "academic",
        "keywords": [
          "CON",
          "Nursing",
          "BSN",
          "Pimentel Hall"
        ]
      }
    ]
  },
  {
    "id": "nstp-building",
    "name": "NSTP Building",
    "shortLabel": "NSTP Building",
    "floors": null,
    "svgPath": "M334.4,753.9 L422.0,675.0 L442.1,697.3 L354.4,776.2 Z",
    "center": {
      "x": 388.2,
      "y": 725.6
    },
    "summary": "National Service Training Program (NSTP) Building.",
    "locations": []
  },
  {
    "id": "con-canteen",
    "name": "CON Canteen",
    "shortLabel": "CON Canteen",
    "floors": null,
    "svgPath": "M406.1,627.4 L429.9,606.0 L478.1,659.5 L454.3,680.9 Z",
    "center": {
      "x": 442.1,
      "y": 643.4
    },
    "summary": "CON Canteen near the central walkway.",
    "locations": []
  },
  {
    "id": "bsu-canteen",
    "name": "BulSU Canteen",
    "shortLabel": "Canteen",
    "floors": null,
    "svgPath": "M777.6,376.4 L793.9,361.7 L846.1,419.6 L829.8,434.3 Z",
    "center": {
      "x": 811.8,
      "y": 398.0
    },
    "summary": "Main University Canteen building.",
    "locations": []
  },
  {
    "id": "srlc-building",
    "name": "Science, Research and Learning Center",
    "shortLabel": "SRLC",
    "floors": null,
    "svgPath": "M406.8,424.9 L464.8,372.7 L482.2,392.1 L424.2,444.2 Z",
    "center": {
      "x": 444.5,
      "y": 408.5
    },
    "summary": "Science, Research and Learning Center beside the E-Library and Heroes Park.",
    "locations": []
  },
  {
    "id": "cbea-building",
    "name": "CBEA Building",
    "shortLabel": "CBEA Building",
    "floors": null,
    "svgPath": "M429.6,450.2 L487.5,398.0 L506.3,418.8 L448.3,471.0 Z",
    "center": {
      "x": 467.9,
      "y": 434.5
    },
    "summary": "College of Business Education and Accountancy building facing Heroes Park.",
    "locations": [
      {
        "id": "cbea",
        "name": "College of Business Education and Accountancy (CBEA)",
        "category": "academic",
        "keywords": [
          "Accountancy",
          "BSA",
          "Business Administration",
          "CBEA",
          "CBA"
        ]
      }
    ]
  },
  {
    "id": "natividad-hall",
    "name": "Natividad Hall",
    "shortLabel": "Natividad Hall",
    "floors": 5,
    "svgPath": "M522.5,568.4 L538.9,553.6 L531.5,545.5 L552.3,526.7 L559.7,534.9 L580.5,516.2 L618.0,557.8 L560.0,610.0 Z M546.6,568.2 L574.8,542.8 L590.9,560.6 L562.7,586.0 Z",
    "center": {
      "x": 569.5,
      "y": 563.7
    },
    "summary": "Five-storey building near Gate 2 serving the College of Engineering.",
    "locations": [
      {
        "id": "coe",
        "name": "College of Engineering (COE)",
        "category": "academic",
        "keywords": [
          "Engineering",
          "Civil",
          "Mechanical",
          "Electrical",
          "ECE",
          "CpE",
          "IE"
        ]
      }
    ]
  },
  {
    "id": "roxas-hall",
    "name": "Roxas Hall",
    "shortLabel": "Roxas Hall",
    "floors": 3,
    "svgPath": "M425.4,583.1 L471.5,541.6 L533.1,610.0 L487.0,651.5 Z M457.9,586.2 L471.2,574.2 L500.7,606.9 L487.3,618.9 Z",
    "center": {
      "x": 479.3,
      "y": 596.5
    },
    "summary": "College of Education Building near Gate 2 housing Student Welfare and OSOA.",
    "locations": [
      {
        "id": "osw",
        "name": "Office of the Student Welfare and Development (OSW) – Main Campus",
        "floor": "Ground Floor",
        "category": "student-services",
        "keywords": [
          "Student Insurance",
          "Grievance",
          "Complaint",
          "DSW",
          "Accident Claim",
          "OSW"
        ],
        "notes": "VoIP (044) 919-7800 local 1077",
        "articleSlug": "how-to-file-a-student-complaint"
      },
      {
        "id": "osoa",
        "name": "Office of the Student Organization and Activities (OSOA)",
        "floor": "Ground Floor",
        "category": "student-services",
        "keywords": [
          "OSOA",
          "Student Orgs",
          "Student Organizations",
          "Balangayan",
          "Posting Approval",
          "Event Permit",
          "Club"
        ],
        "notes": "VoIP (044) 919-7800 local 1077",
        "articleSlug": "bulsu-student-organizations-guide"
      }
    ]
  }
];
