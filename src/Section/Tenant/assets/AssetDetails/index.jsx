import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Tabs from "../../../../Components/UI/Tabs";
import { getTenantAssetDetails } from "../../../../axios/assets/tenantAssets";
import HeaderCard from "./HeaderCard";
import RFIDCard from "./RFIDCard";
import LifecycleCard from "./LifecycleCard";
import { TAB_COMPONENTS } from "./components";
import { normalizeAssetDetailResponse } from "./data";
import Card from "../../../../Components/UI/Card";
import Alert from "../../../../Components/UI/Alert";
import Button from "../../../../Components/UI/Button";
import CardSkeleton from "../../../../Components/UI/CardSkeleton";
import { getApiErrorMessage } from "../../../../axios/api";

const AssetDetailsIndex = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [retryKey, setRetryKey] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const tabLabels = useMemo(() => data?.tabs.map((tab) => tab.label) || [], [data]);
    const requestedTab = searchParams.get("tab");
    const activeTab = tabLabels.includes(requestedTab) ? requestedTab : "Overview";
    const ActiveTabComponent = TAB_COMPONENTS[activeTab];

    useEffect(() => {
        let isActive = true;
        // Loading synchronizes this page with the requested external asset resource.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);
        setLoadError("");
        setData(null);

        getTenantAssetDetails(id)
            .then((response) => {
                if (isActive) {
                    console.log("Tenant asset detail response:", response);
                    setData(normalizeAssetDetailResponse(response));
                }
            })
            .catch((error) => {
                if (isActive) {
                    console.error("Unable to load tenant asset details:", error.message);
                    setLoadError(getApiErrorMessage(error, "Unable to load asset details"));
                }
            })
            .finally(() => {
                if (isActive) setIsLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [id, retryKey]);

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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
                    <CardSkeleton lines={5} />
                    <CardSkeleton lines={4} />
                </div>
                <CardSkeleton lines={3} />
            </div>
        );
    }

    if (loadError || !data) {
        return (
            <Alert variant="danger">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>{loadError || "Asset details are unavailable"}</span>
                    <Button onClick={() => setRetryKey((current) => current + 1)} size="sm" variant="outline">
                        Try Again
                    </Button>
                </div>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
                <HeaderCard data={data} />
                <RFIDCard data={data} />
            </div>

            <LifecycleCard data={data} />

            <Card >
                <div className="mb-6 overflow-x-auto">
                    <Tabs
                        items={data.tabs.map((tab) => ({
                            label: tab.label,
                            value: tab.label,
                        }))}
                        value={activeTab}
                        onChange={handleTabChange}
                    />
                </div>

                <div>
                    {ActiveTabComponent ? (
                        <ActiveTabComponent data={data} />
                    ) : (
                        <div className="flex min-h-50 items-center justify-center text-sm font-semibold text-(--theme-text-muted)">
                            No content available
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AssetDetailsIndex;
