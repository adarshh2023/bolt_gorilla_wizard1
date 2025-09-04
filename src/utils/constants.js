export const WIZARD_STEPS = [
  { id: 1, name: "Project Overview", key: "overview" },
  { id: 2, name: "Tower & Wing Declaration", key: "towers" },
  { id: 3, name: "Floor Configuration", key: "floors" },
  { id: 4, name: "Unit Configuration", key: "units" },
  { id: 5, name: "Review & Finalize", key: "review" },
];

export const PROJECT_TYPES = ["Residential", "Commercial", "Mall", "Mixed-use"];

export const TOWER_PRESET_OPTIONS = [
  "Tower A",
  "Tower B",
  "Tower C",
  "Tower D",
  "North Tower",
  "South Tower",
  "East Tower",
  "West Tower",
  "Main Tower",
  "Central Tower",
  "Custom",
];

export const FLAT_NUMBERING_TYPES = [
  {
    value: "wing-floor-unit",
    label: "Wing-Floor-Unit (A-101, B-205)",
    description: "Wing letter + Floor number + Unit number",
    example: "A-101, A-102, B-201, B-202",
  },
  {
    value: "tower-wing-floor-unit",
    label: "Tower-Wing-Floor-Unit (T1A101, T2B205)",
    description: "Tower + Wing + Floor + Unit",
    example: "T1A101, T1A102, T2B201, T2B202",
  },
  {
    value: "sequential",
    label: "Sequential (101, 102, 201, 202)",
    description: "Floor number + Unit sequence",
    example: "101, 102, 103, 201, 202, 203",
  },
  {
    value: "custom",
    label: "Custom Pattern",
    description: "Define your own numbering pattern",
    example: "Custom format",
  },
];

export const WING_TYPES = ["Commercial", "Residential", "Mixed"];

export const FLOOR_TYPES_ORDER = [
  "Basement",
  "Podium",
  "Ground",
  "Floors",
  "Terrace",
];

export const UNIT_TYPES = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "Duplex",
  "Penthouse",
  "Studio",
  "Office",
  "Retail",
  "Custom",
];

export const USAGE_TYPES = {
  basement: [
    "Parking",
    "Storage",
    "Utilities",
    "Retail",
    "Restaurant",
    "Gym",
    "Swimming Pool",
    "Mechanical Room",
    "Generator Room",
    "Water Treatment",
    "Custom",
  ],
  ground: [
    "Lobby",
    "Retail",
    "Restaurant",
    "Banking",
    "Office",
    "Mixed",
    "Custom",
  ],
  podium: [
    "Amenities",
    "Parking",
    "Retail",
    "Office",
    "Recreation",
    "Swimming Pool",
    "Gym",
    "Banquet Hall",
    "Terrace Garden",
    "Mixed",
    "Custom",
  ],
  floors: ["Commercial", "Residential"],
  terrace: [
    "Amenities",
    "Garden",
    "Recreation",
    "Restaurant",
    "Event Space",
    "Open Space",
    "Custom",
  ],
};

export const FLOOR_TYPES = {
  commercial: [
    "Office",
    "Retail",
    "Restaurant",
    "Banking",
    "Medical",
    "Co-working",
    "Conference",
    "Custom",
  ],
  residential: [
    "Apartments",
    "Penthouses",
    "Duplexes",
    "Studios",
    "Service Apartments",
    "Custom",
  ],
};

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Updated project data structure without phases
export const INITIAL_PROJECT_DATA = {
  // Step 1: Project Overview
  projectName: "",
  projectCode: "",
  projectType: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  startDate: "",
  endDate: "",
  manager: "",

  // Step 2: Tower & Wing Declaration
  towers: [],

  // Step 3: Floor Configuration
  floorConfigurations: {},

  // Step 4: Unit Configuration
  units: {},

  // Step 5: Amenities
  amenities: {},

  // Meta
  lastSaved: null,
  isDirty: false,
};

export const TOWER_TEMPLATE = {
  id: "",
  name: "",
  wings: [],
};

export const WING_TEMPLATE = {
  id: "",
  name: "",
  type: "Residential", // Commercial/Residential/Mixed
  floorTypes: {
    Basement: { enabled: false, count: 0 },
    Podium: { enabled: false, count: 0 },
    Ground: { enabled: true, count: 1 },
    Floors: { enabled: true, count: 10 },
    Terrace: { enabled: false, count: 0 },
  },
  lifts: 2,
};

export const SAMPLE_PROJECT_DATA = {
  projectName: "Gorealla Heights",
  projectCode: "GH-MUM-2025",
  projectType: "Residential",
  address: "Plot 12, Andheri East",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400069",
  startDate: "2025-09-01",
  endDate: "2028-03-31",
  manager: "Ankit Shah",
  phaseType: "Multiple",
};
