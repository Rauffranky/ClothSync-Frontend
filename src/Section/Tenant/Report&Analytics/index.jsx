import { useState } from "react";
import Tabs from "../../../Components/UI/Tabs";
import useDashboardPeriod from "../../../Hooks/useDashboardPeriod";
import ReportsFilters from "./ReportsFilters";
import ReportsHeader from "./ReportsHeader";
import ReportsStatsGrid from "./ReportsStatsGrid";
import DelayedItems from "./DelayedItems";
import MissingLost from "./MissingLost";
import Overview from "./Overview";
import SentVsReturn from "./SentVsReturn";
import TurnaroundTime from "./TurnAroundTime";
import CategoryWise from "./CategoryWise";
import LaundryWise from "./LaundryWise";
import WashCycleSummary from "./WashCycleSummary";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "sent_returned", label: "Sent vs Returned" },
  { value: "delayed", label: "Delayed Items" },
  { value: "missing", label: "Missing / Lost" },
  { value: "turnaround", label: "Turnaround Time" },
  { value: "wash_cycle", label: "Wash Cycle Summary" },
  { value: "category_wise", label: "Category Wise" },
  { value: "laundry_wise", label: "Laundry Wise" },
];

const TAB_CONTENT = {
};

const TAB_COMPONENTS = {
  overview: Overview,
  sent_returned: SentVsReturn,
  delayed: DelayedItems,
  missing: MissingLost,
  turnaround: TurnaroundTime,
  category_wise: CategoryWise,
  wash_cycle: WashCycleSummary,
  laundry_wise: LaundryWise,
};

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({ date: "30d", laundry: null, category: null });
  const { customRange, setCustomFrom, setCustomTo } = useDashboardPeriod();

  const handleFilter = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));
  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <ReportsHeader
        customRange={customRange}
        onFromChange={setCustomFrom}
        onToChange={setCustomTo}
      />

      {/* Stats row */}
      <ReportsStatsGrid />

      {/* Filters */}
      <ReportsFilters filters={filters} onFilter={handleFilter} />

      {/* Tabs */}
      <div className="hide-scrollbar overflow-x-auto">
        <Tabs
          className="w-max"
          itemClassName="whitespace-nowrap"
          items={TABS}
          onChange={setActiveTab}
          value={activeTab}
        />
      </div>

      {/* Tab content */}
      {ActiveTabComponent ? (
        <ActiveTabComponent />
      ) : (
        <p
          className="px-1 text-sm"
          style={{ color: "var(--theme-text-secondary)" }}
        >
          {TAB_CONTENT[activeTab]}
        </p>
      )}
    </div>
  );
};

export default ReportsAnalytics;
