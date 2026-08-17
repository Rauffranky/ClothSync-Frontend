import { useState } from "react";
import Tabs from "../../../Components/UI/Tabs";
import FiltersSection from "./FiltersSection";
import StatsGrid from "./StatsGrid";
import OverviewTab from "./overview";
import CheckInSummaryTab from "./CheckInSummary";
import CheckOutSummaryTab from "./CheckOutSummary";
import ThroughputTab from "./Throughput";
import DelayedItemsTab from "./DelayedItems";
import ScannerActivityTab from "./ScannerActivity";

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Check-In Summary", value: "check-in" },
    { label: "Check-Out Summary", value: "check-out" },
    { label: "Business-Wise Throughput", value: "throughput" },
    { label: "In-Laundry Inventory", value: "inventory" },
    { label: "Delayed Items", value: "delayed" },
    { label: "Scanner Activity", value: "scanner-activity" },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <FiltersSection />

      <StatsGrid />

      <div className="mt-2">
        <Tabs items={tabs} value={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "check-in" && <CheckInSummaryTab />}
          {activeTab === "check-out" && <CheckOutSummaryTab />}
          {activeTab === "throughput" && <ThroughputTab />}
          {activeTab === "delayed" && <DelayedItemsTab />}
          {activeTab === "scanner-activity" && <ScannerActivityTab />}
          
          {activeTab === "inventory" && (
            <div className="rounded-2xl border border-(--theme-border) bg-(--theme-surface) p-8 text-center">
              <div className="text-lg font-semibold text-(--theme-text-primary)">
                Content for {tabs.find((t) => t.value === activeTab)?.label}
              </div>
              <p className="mt-2 text-sm text-(--theme-text-muted)">
                Tab contents will be implemented here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
