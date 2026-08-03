import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Tabs from "../../../../Components/UI/Tabs";
import ActivityLogTab from "./components/ActivityLogTab";
import BatchHeaderInfo from "./components/BatchHeaderInfo";
import BatchItemsTab from "./components/BatchItemsTab";
import BatchLifecycle from "./components/BatchLifecycle";
import OverviewTab from "./components/OverviewTab";
import { getMockBatchDetails } from "./data";

const DispatchDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const details = useMemo(() => {
    return getMockBatchDetails(id || "BATCH-1024");
  }, [id]);

  const tabItems = [
    {
      label: "Overview",
      value: "overview",
    },
    {
      label: "Batch Items",
      value: "items",
      count: details.summary.totalItems,
    },
    {
      label: "Activity Log",
      value: "activity",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Meta Cards */}
      <BatchHeaderInfo details={details} />

      {/* Batch Lifecycle Tracker */}
      <BatchLifecycle steps={details.lifecycle} />

      {/* Global Tabs Navigation */}
      <div className="pt-2">
        <Tabs
          items={tabItems}
          value={activeTab}
          onChange={setActiveTab}
          equalWidth={false}
          rounded="16px"
        />

        {/* Tab Contents */}
        {activeTab === "overview" && <OverviewTab details={details} />}
        {activeTab === "items" && <BatchItemsTab items={details.items} />}
        {activeTab === "activity" && (
          <ActivityLogTab logs={details.fullActivityLog} batchId={details.id} />
        )}
      </div>
    </div>
  );
};

export default DispatchDetails;
