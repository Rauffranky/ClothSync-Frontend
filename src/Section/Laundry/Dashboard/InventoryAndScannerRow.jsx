import { ArrowRight, Settings, Wifi, WifiOff } from "lucide-react";
import Card from "../../../Components/UI/Card";

const inventory = [
  { name: "Grand Plaza Hotel", laundry: 284, processed: 192, ready: 98, delayed: 4 },
  { name: "CityCare Hospital", laundry: 176, processed: 88, ready: 42, delayed: 12 },
  { name: "Royal Suites", laundry: 133, processed: 71, ready: 60, delayed: 2 },
  { name: "Metro Textile Services", laundry: 410, processed: 210, ready: 188, delayed: 18 },
];

const scanners = [
  { name: "Entry Gate Alpha", location: "Receiving Bay", mode: "Entry", status: "Active", time: "2 min ago", color: "var(--color-seafoam)" },
  { name: "Exit Gate Bravo", location: "Dispatch Area", mode: "Exit", status: "Active", time: "8 min ago", color: "var(--color-seafoam)" },
  { name: "Handheld Unit 1", location: "Processing Floor", mode: "Automatic", status: "Active", time: "Just now", color: "var(--color-seafoam)" },
  { name: "Wash Bay Scanner", location: "Wash Bay B", mode: "Automatic", status: "Warning", time: "45 min ago", color: "var(--color-pending)" },
  { name: "Dry Zone Scanner", location: "Dry Zone", mode: "Automatic", status: "Inactive", time: "3 hrs ago", color: "var(--theme-text-muted)" },
];

const Box = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ScanLineIcon = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

const InventoryAndScannerRow = () => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <Card padding="20px">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-(--theme-text-primary)">
           <Box size={18} className="text-(--color-super-admin-light)" />
           In-Laundry Inventory
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-(--color-sky-blue)">
          View All <ArrowRight size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-5">
        {inventory.map((item) => (
          <div key={item.name} className="flex flex-col gap-2 border-b border-(--theme-border-soft) pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-(--theme-text-primary)">{item.name}</span>
              <button className="text-xs font-bold text-(--color-sky-blue)">View</button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="flex flex-col">
                <span className="text-lg font-black text-(--color-super-admin-light)">{item.laundry}</span>
                <span className="text-[10px] font-semibold text-(--theme-text-muted)">Laundry</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-(--color-sky-blue)">{item.processed}</span>
                <span className="text-[10px] font-semibold text-(--theme-text-muted)">Processed</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-(--color-seafoam)">{item.ready}</span>
                <span className="text-[10px] font-semibold text-(--theme-text-muted)">Ready</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-(--color-pending)">{item.delayed}</span>
                <span className="text-[10px] font-semibold text-(--theme-text-muted)">Delayed</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card padding="20px">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-(--theme-text-primary)">
           <ScanLineIcon size={18} className="text-(--color-sky-blue)" />
           Scanner Status
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-(--color-sky-blue) px-3 py-1.5 text-xs font-bold text-white">
          <Settings size={14} /> Manage
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {scanners.map((scanner) => (
          <div key={scanner.name} className="flex items-center justify-between rounded-xl border border-(--theme-border-soft) p-3">
             <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" 
                  style={{ background: `${scanner.color}1A`, color: scanner.color }}
                >
                  {scanner.status === "Inactive" ? <WifiOff size={18} /> : <Wifi size={18} />}
                </div>
                <div>
                   <p className="text-sm font-bold text-(--theme-text-primary)">{scanner.name}</p>
                   <p className="mt-0.5 flex items-center gap-2 text-xs text-(--theme-text-muted)">
                     <span>{scanner.location}</span>
                     <span className="h-1 w-1 rounded-full bg-(--theme-border-soft)" />
                     <span>{scanner.mode}</span>
                   </p>
                </div>
             </div>
             <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                   <div className="h-1.5 w-1.5 rounded-full" style={{ background: scanner.color }} />
                   <span className="text-xs font-bold" style={{ color: scanner.color }}>{scanner.status}</span>
                </div>
                <p className="mt-0.5 text-[11px] font-semibold text-(--theme-text-muted)">{scanner.time}</p>
             </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default InventoryAndScannerRow;
