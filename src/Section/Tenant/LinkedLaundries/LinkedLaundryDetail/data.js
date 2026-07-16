import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Box,
} from "lucide-react";

export const laundryDetails = {
  id: "LND-FC-0042",
  name: "FreshCare Laundry",
  status: "Connected",
  statusVariant: "success",
  isDefault: true,
  contact: {
    name: "Maria Chen",
    email: "maria.chen@freshcarelaundry.com",
    phone: "+1 (555) 847-2291",
    address: "142 Industrial Blvd, Suite 4, Chicago, IL 60601",
    linkedSince: "March 15, 2025"
  },
  stats: {
    activeBatches: 3,
    itemsSent: 312,
    itemsSentTrend: "+18",
    itemsReturned: 229,
    itemsReturnedTrend: "+24",
    inLaundry: 71,
    delayedItems: 8,
    delayedTrend: "+3",
    avgTurnaround: "28h",
    turnaroundTrend: "-2h"
  },
  performance: {
    totalDispatched: 792,
    returnRate: "91.2%",
    delayedRate: "2.8%",
    avgTurnaround: "28h"
  }
};

export const recentBatches = [
  {
    id: "BTH-20240611-001",
    status: "In Laundry",
    statusVariant: "purple",
    date: "Jun 11, 2025",
    items: 142,
    delayed: 3,
    icon: Box
  },
  {
    id: "BTH-20240609-017",
    status: "Processed",
    statusVariant: "success",
    date: "Jun 9, 2025",
    items: 87,
    delayed: 0,
    icon: CheckCircle2
  },
  {
    id: "BTH-20240607-009",
    status: "Delayed",
    statusVariant: "warning",
    date: "Jun 7, 2025",
    items: 210,
    delayed: 8,
    icon: AlertCircle
  },
  {
    id: "BTH-20240603-022",
    status: "Returned",
    statusVariant: "info",
    date: "Jun 3, 2025",
    items: 65,
    delayed: 0,
    icon: RotateCcw
  }
];

export const dispatchBatches = [
  { id: "BTH-20240611-001", date: "Jun 11, 2025", items: 142, status: "In Laundry", statusVariant: "purple" },
  { id: "BTH-20240609-017", date: "Jun 9, 2025", items: 87, status: "Processed", statusVariant: "success" },
  { id: "BTH-20240607-009", date: "Jun 7, 2025", items: 210, status: "Delayed", statusVariant: "warning" },
  { id: "BTH-20240603-022", date: "Jun 3, 2025", items: 65, status: "Returned", statusVariant: "info" },
  { id: "BTH-20240528-004", date: "May 28, 2025", items: 190, status: "Returned", statusVariant: "info" },
  { id: "BTH-20240515-007", date: "May 15, 2025", items: 98, status: "Returned", statusVariant: "info" }
];

export const inventoryData = [
  { id: "LNS-BED-0041", name: "King Duvet Cover", epc: "E2800189...40A63", category: "Bed Linen", categoryVariant: "info", batch: "BTH-20240611-001", status: "In Laundry", statusVariant: "purple", scan: "Jun 11, 10:30", days: "1d" },
  { id: "LNS-TWL-0198", name: "Bath Towel — Large", epc: "E2800189...40B77", category: "Bath Towels", categoryVariant: "success", batch: "BTH-20240611-001", status: "In Laundry", statusVariant: "purple", scan: "Jun 11, 10:28", days: "1d" },
  { id: "LNS-BED-0099", name: "Pillow Case Set", epc: "E2800189...40D99", category: "Bed Linen", categoryVariant: "info", batch: "BTH-20240607-009", status: "Delayed", statusVariant: "warning", scan: "Jun 9, 15:00", days: "5d", delayedText: "DELAYED" },
  { id: "LNS-UNF-0067", name: "Housekeeping Apron", epc: "E2800189...40C88", category: "Uniforms", categoryVariant: "purple", batch: "BTH-20240609-017", status: "Returned", statusVariant: "info", scan: "Jun 10, 08:40", days: "3d" },
  { id: "LNS-TBL-0011", name: "Round Tablecloth", epc: "E2800189...41033", category: "Table Linen", categoryVariant: "warning", batch: "BTH-20240609-017", status: "Returned", statusVariant: "info", scan: "Jun 10, 09:12", days: "3d" },
  { id: "LNS-POL-0001", name: "Pool Towel XL", epc: "E2800189...51200", category: "Pool Towels", categoryVariant: "primary", batch: "BTH-20240611-001", status: "In Laundry", statusVariant: "purple", scan: "Jun 11, 10:15", days: "1d" },
  { id: "LNS-TWL-0210", name: "Bath Towel — Medium", epc: "E2800189...41033", category: "Bath Towels", categoryVariant: "success", batch: "BTH-20240607-009", status: "Delayed", statusVariant: "warning", scan: "Jun 7, 14:00", days: "5d", delayedText: "DELAYED" },
  { id: "LNS-BED-0122", name: "Queen Flat Sheet", epc: "E2800189...70011", category: "Bed Linen", categoryVariant: "info", batch: "BTH-20240603-022", status: "Returned", statusVariant: "info", scan: "Jun 5, 11:00", days: "2d" }
];

export const activityLogs = [
  {
    type: "info",
    icon: Activity,
    title: "Dispatch Mode Changed to Automatic",
    desc: "Switched from Manual to Automatic for batch BTH-20240611-001.",
    date: "Jun 11, 2025 - 08:00",
    variant: "primary"
  },
  {
    type: "dispatch",
    icon: Truck,
    title: "Batch Dispatched",
    badge: "BTH-20240611-001",
    desc: "142 items auto-dispatched to FreshCare Laundry.",
    date: "Jun 11, 2025 - 09:00",
    variant: "warning"
  },
  {
    type: "checkin",
    icon: Box,
    title: "Items Checked In at Laundry",
    badge: "BTH-20240611-001",
    desc: "71 of 142 items checked in via RFID scanner.",
    date: "Jun 11, 2025 - 10:30",
    variant: "purple"
  },
  {
    type: "exception",
    icon: AlertCircle,
    title: "Exception Raised",
    badge: "EXC-0041",
    desc: "Missing batch item — LNS-BED-0099 not found in batch BTH-20240607.",
    date: "Jun 9, 2025 - 15:22",
    variant: "danger"
  },
  {
    type: "success",
    icon: CheckCircle2,
    title: "Batch Processed",
    badge: "BTH-20240609-017",
    desc: "87 items marked Washed / Processed via exit scanner.",
    date: "Jun 9, 2025 - 14:00",
    variant: "success"
  }
];
