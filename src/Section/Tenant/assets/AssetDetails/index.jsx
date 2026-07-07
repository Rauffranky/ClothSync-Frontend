import { useState } from "react";
import Tabs from "../../../../Components/UI/Tabs";
import HeaderCard from "./HeaderCard";
import RFIDCard from "./RFIDCard";
import LifecycleCard from "./LifecycleCard";
import OverviewTab from "./OverviewTab";
import { assetDetailData } from "./data";

const AssetDetailsIndex = () => {
    const data = assetDetailData;
    const [activeTab, setActiveTab] = useState("Overview");

    return (
        <div className="space-y-6">
            <div className="grid gap-2 lg:grid-cols-[1fr_440px]">
                <div>
                    <HeaderCard data={data} />
                </div>
                <div>
                    <RFIDCard data={data} />
                </div>
            </div>

            <LifecycleCard data={data} />

            <div className="rounded-[18px] border border-(--theme-border) bg-(--theme-surface) p-6 shadow-[var(--card-shadow)]">
                <div className="mb-6 overflow-x-auto">
                    <Tabs
                        items={data.tabs.map((tab) => ({
                            label: tab.label,
                            value: tab.label,
                            count: tab.count !== null ? tab.count : undefined,
                        }))}
                        value={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                <div>
                    {activeTab === "Overview" ? (
                        <OverviewTab data={data} />
                    ) : (
                        <div className="flex min-h-[200px] items-center justify-center text-sm font-semibold text-(--theme-text-muted)">
                            {activeTab} content goes here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetDetailsIndex;
