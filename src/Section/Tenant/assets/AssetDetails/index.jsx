import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Tabs from "../../../../Components/UI/Tabs";
import HeaderCard from "./HeaderCard";
import RFIDCard from "./RFIDCard";
import LifecycleCard from "./LifecycleCard";
import { TAB_COMPONENTS } from "./components";
import { assetDetailData } from "./data";
import Card from "../../../../Components/UI/Card";

const AssetDetailsIndex = () => {
    const data = assetDetailData;
    const [searchParams, setSearchParams] = useSearchParams();
    const tabLabels = useMemo(() => data.tabs.map((tab) => tab.label), [data.tabs]);
    const requestedTab = searchParams.get("tab");
    const activeTab = tabLabels.includes(requestedTab) ? requestedTab : "Overview";
    const ActiveTabComponent = TAB_COMPONENTS[activeTab];

    const handleTabChange = (nextTab) => {
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            if (nextTab === "Overview") {
                nextParams.delete("tab");
            } else {
                nextParams.set("tab", nextTab);
            }
            return nextParams;
        }, { replace: true });
    };

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

            <Card >
                <div className="mb-6 overflow-x-auto">
                    <Tabs
                        items={data.tabs.map((tab) => ({
                            label: tab.label,
                            value: tab.label,
                            count: tab.count !== null ? tab.count : undefined,
                        }))}
                        value={activeTab}
                        onChange={handleTabChange}
                    />
                </div>

                <div>
                    {ActiveTabComponent ? (
                        <ActiveTabComponent data={data} />
                    ) : (
                        <div className="flex min-h-[200px] items-center justify-center text-sm font-semibold text-(--theme-text-muted)">
                            No content available
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AssetDetailsIndex;
