export const flowSteps = [
  {
    id: "connect",
    portal: "Business portal",
    screen: "Linked Laundries",
    title: "Connect your laundry partner.",
    description:
      "Start with the people behind the process. Invite your laundry partner and manage the connection from your business workspace.",
    points: [
      "Send an invitation to your laundry partner",
      "Follow pending and accepted connections",
      "Manage the partners handling your linen",
    ],
    outcome: "Your business and laundry are connected in Trackly.",
    columns: ["Partner", "Connection", "Dispatch mode"],
    rows: [
      ["Example Laundry", "Connected", "Manual"],
      ["Sample Laundry", "Pending", "Manual"],
    ],
    metric: "Partner connections",
    value: "02",
    status: "Connected",
  },
  {
    id: "inventory",
    portal: "Business portal",
    screen: "Assets & Categories",
    title: "Build an inventory you can follow.",
    description:
      "Organize linen into categories, register individual assets, and link item tags so every piece has a traceable identity.",
    points: [
      "Create categories for linen and uniforms",
      "Register assets and assign item tags",
      "Keep location and wash lifecycle details together",
    ],
    outcome: "Every registered item has a place in your inventory.",
    columns: ["Asset", "Category", "Status"],
    rows: [
      ["Bath towel · 001", "Bath Towels", "In Business"],
      ["Bed sheet · 002", "Bed Linen", "In Business"],
      ["Uniform · 003", "Uniforms", "In Business"],
    ],
    metric: "Registered items",
    value: "03",
    status: "In Business",
  },
  {
    id: "dispatch",
    portal: "Business portal",
    screen: "Bulk Scanning & Dispatch Batches",
    title: "Scan, verify, and dispatch.",
    description:
      "Capture tagged items with your connected scanner, review the movement, and check them out to a linked laundry.",
    points: [
      "Identify the items leaving your business",
      "Choose the linked laundry for check-out",
      "Track the resulting dispatch batch",
    ],
    outcome: "The outgoing items are recorded against their batch.",
    columns: ["Batch", "Destination", "Status"],
    rows: [
      ["DEMO-001", "Example Laundry", "Dispatched"],
      ["DEMO-002", "Example Laundry", "Dispatched"],
    ],
    metric: "Outgoing batches",
    value: "02",
    status: "Dispatched",
  },
  {
    id: "receive",
    portal: "Laundry portal",
    screen: "Bulk Scanning & Incoming Batches",
    title: "Receive with a clear item trail.",
    description:
      "The laundry scans incoming items and follows receipt progress against the business batch. Missing or pending items remain visible for follow-up.",
    points: [
      "Scan incoming tagged items at the laundry",
      "Review batch items and receipt progress",
      "Follow discrepancies with the partner business",
    ],
    outcome: "Both sides can follow the items received at the laundry.",
    columns: ["Item", "Batch", "Status"],
    rows: [
      ["Bath towel · 001", "DEMO-001", "At Laundry"],
      ["Bed sheet · 002", "DEMO-001", "At Laundry"],
      ["Uniform · 003", "DEMO-001", "Pending"],
    ],
    metric: "Received in example batch",
    value: "2 / 3",
    status: "At Laundry",
  },
  {
    id: "return",
    portal: "Laundry portal",
    screen: "Bulk Scanning & Batches",
    title: "Send the clean items back.",
    description:
      "Use the laundry scanning workflow to check out returning items. Follow batch progress and retain the history of each handoff.",
    points: [
      "Identify the items ready for return",
      "Check out items through Bulk Scanning",
      "Monitor the return against the original batch",
    ],
    outcome: "Returning items stay linked to their business and batch.",
    columns: ["Item", "Partner", "Status"],
    rows: [
      ["Bath towel · 001", "Example Business", "Sent to Business"],
      ["Bed sheet · 002", "Example Business", "Sent to Business"],
    ],
    metric: "Items in this return",
    value: "02",
    status: "Sent to Business",
  },
  {
    id: "complete",
    portal: "Business portal",
    screen: "Bulk Scanning & Asset History",
    title: "Check in. Reconcile. Repeat.",
    description:
      "Scan returned items into the business, review batch progress, and inspect asset history and wash counts before the next journey begins.",
    points: [
      "Verify returned items with a business check-in",
      "Review outstanding items and discrepancies",
      "Follow the asset and tag wash lifecycle",
    ],
    outcome:
      "The return is recorded and your inventory reflects the latest movement.",
    columns: ["Asset", "Movement", "Status"],
    rows: [
      ["Bath towel · 001", "Check In", "In Business"],
      ["Bed sheet · 002", "Check In", "In Business"],
    ],
    metric: "Items checked back in",
    value: "02",
    status: "In Business",
  },
];
