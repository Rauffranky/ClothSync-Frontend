import { useState } from "react";
import Card from "../../../Components/UI/Card";
import Tabs from "../../../Components/UI/Tabs";
import { laundries, pendingRequests } from "./data";
import LinkedLaundries from "./LinkedLaundries";
import PendingRequest from "./PendingRequest";
import Stats from "./Stats";

const Laundries = () => {
  const [activeTab, setActiveTab] = useState("linked");

  return (
    <div className="space-y-5">
      <Stats />

      <Card padding="0" rounded="18px">
        <div className="border-b border-(--theme-border) px-4 py-4">
          <Tabs
            className="inline-grid border-0 bg-transparent p-0 shadow-none"
            itemClassName="min-w-38"
            items={[
              {
                label: "Linked Laundries",
                value: "linked",
                count: laundries.length,
              },
              {
                label: "Pending Requests",
                value: "pending",
                count: pendingRequests.length,
              },
            ]}
            onChange={setActiveTab}
            value={activeTab}
          />
        </div>

        {activeTab === "linked" ? <LinkedLaundries /> : <PendingRequest />}
      </Card>
    </div>
  );
};

export default Laundries;
