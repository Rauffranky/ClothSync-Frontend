import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../Components/UI/Card";
import Tabs from "../../../Components/UI/Tabs";
import LinkedLaundries from "./LinkedLaundries";
import PendingRequest from "./PendingRequest";
import Stats from "./Stats";

const Laundries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "pending" ? "pending" : "linked";

  const handleTabChange = (val) => {
    setSearchParams({ tab: val }, { replace: true });
  };

  const [totals, setTotals] = useState({});
  const handleLinkedTotalChange = useCallback((total) => {
    setTotals((current) => ({ ...current, linked: total }));
  }, []);
  const handlePendingTotalChange = useCallback((total) => {
    setTotals((current) => ({ ...current, pending: total }));
  }, []);

  return (
    <div className="space-y-5">
      <Stats linkedTotal={totals.linked} pendingTotal={totals.pending} />

      <Card padding="0" rounded="18px">
        <div className="border-b border-(--theme-border) px-4 py-4">
          <Tabs
            className="inline-grid border-0 bg-transparent p-0 shadow-none"
            itemClassName="min-w-38"
            items={[
              {
                label: "Linked Laundries",
                value: "linked",
                count: totals.linked,
              },
              {
                label: "Pending Requests",
                value: "pending",
                count: totals.pending,
              },
            ]}
            onChange={handleTabChange}
            value={activeTab}
          />
        </div>

        {activeTab === "linked" ? (
          <LinkedLaundries onTotalChange={handleLinkedTotalChange} />
        ) : (
          <PendingRequest onTotalChange={handlePendingTotalChange} />
        )}
      </Card>
    </div>
  );
};

export default Laundries;
