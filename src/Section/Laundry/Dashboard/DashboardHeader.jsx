import Dropdown from "../../../Components/UI/Dropdown";
import Card from "../../../Components/UI/Card";

const DashboardHeader = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--theme-text-primary)" }}
          >
            Laundry Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--theme-text-muted)" }}>
            Monitor incoming batches, processing activity, inventory, scanner status, and exceptions across linked businesses.
          </p>
        </div>
        {/* Test scanner controls are disabled; the Android APK owns real scans. */}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          {/* <span className="text-sm font-semibold" style={{ color: "var(--theme-text-muted)" }}>Viewing:</span> */}
          <div className="w-56">
            <Dropdown
              options={[{ label: "All Linked Businesses", value: "all" }]}
              value="all"
              onChange={() => { }}
              triggerClassName="h-[36px]! min-h-0! py-0!"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="h-2 w-2 rounded-full" style={{ background: "var(--color-seafoam)" }} />
          <span style={{ color: "var(--theme-text-muted)" }}>6 batches - 1003 items in laundry</span>
        </div>
      </div>

      <Card padding="16px 20px">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-seafoam)" }} />
              <span style={{ color: "var(--theme-text-primary)" }}>Live Operations Active</span>
            </div>
            <div className="hidden h-4 w-px sm:block" style={{ background: "var(--theme-border-soft)" }} />
            <div style={{ color: "var(--theme-text-muted)" }}>
              Active Scanners: <span style={{ color: "var(--theme-text-primary)" }}>3 / 5</span>
            </div>
            <div style={{ color: "var(--theme-text-muted)" }}>
              Batches Waiting: <span style={{ color: "var(--theme-text-primary)" }}>4</span>
            </div>
            <div style={{ color: "var(--theme-text-muted)" }}>
              Last RFID Scan: <span style={{ color: "var(--theme-text-primary)" }}>Just now</span>
            </div>
          </div>
          <div style={{ color: "var(--theme-text-muted)" }}>
            Last Updated: <span style={{ color: "var(--theme-text-primary)" }}>Just now</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
export default DashboardHeader;
