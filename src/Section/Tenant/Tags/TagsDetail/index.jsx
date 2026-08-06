import { useEffect, useState } from "react";
import { Cpu, History, Logs } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import Badge from "../../../../Components/UI/Badge";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Tabs from "../../../../Components/UI/Tabs";
import { getTenantTagDetails } from "../../../../axios/tags/tenantTags";
import { formatStatusLabel } from "../../../../Utils/status";
import MappingHistory from "./MappingHistory";
import ScanLogsTable from "./ScanLogsTable";
import StatsRow from "./StatsRow";

const TAB_SCAN_LOGS = "scan-logs";
const TAB_MAPPING_HISTORY = "mapping-history";

const TagDetailIndex = () => {
  const { id: tagId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tagData, setTagData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeTab =
    searchParams.get("tab") === TAB_MAPPING_HISTORY
      ? TAB_MAPPING_HISTORY
      : TAB_SCAN_LOGS;

  const handleTabChange = (nextTab) => {
    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current);
      nextParams.set("tab", nextTab);
      return nextParams;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      if (!tagId) {
        if (isMounted) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getTenantTagDetails(tagId);
        if (!isMounted) return;

        const payload = res?.data ?? res ?? {};
        const tag = payload.tag || payload.data?.tag || payload;
        const overview = payload.overview || payload.data?.overview || null;

        if (tag && (tag.tagCode || tag.code || tag.id || tag.epc)) {
          setTagData(tag);
          setOverviewData(overview);
        } else {
          setTagData({
            id: tagId,
            tagCode: tagId || "Tag-001",
            epc: "E2800189200040D6",
            tagStatusLabel: "Active",
            currentStatusLabel: "In Laundry",
          });
          setOverviewData(null);
        }
      } catch {
        if (!isMounted) return;
        setTagData({
          id: tagId,
          tagCode: tagId || "Tag-001",
          epc: "E2800189200040D6",
          tagStatusLabel: "Active",
          currentStatusLabel: "In Laundry",
        });
        setOverviewData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [tagId]);

  const tabItems = [
    {
      label: "Scan Logs",
      value: TAB_SCAN_LOGS,
      icon: <Logs size={16} />,
    },
    {
      label: "Mapping History",
      value: TAB_MAPPING_HISTORY,
      icon: <History size={16} />,
    },
  ];

  const tagCode =
    tagData?.tagCode || tagData?.code || tagData?.id || tagId || "Tag-001";
  const epcCode = tagData?.epc || "—";
  const tagStatus =
    tagData?.tagStatusLabel ||
    (tagData?.tagStatus ? formatStatusLabel(tagData.tagStatus) : "Active");
  const currentStatus =
    tagData?.currentStatusLabel ||
    (tagData?.currentStatus
      ? formatStatusLabel(tagData.currentStatus)
      : tagData?.asset?.statusLabel || "In Laundry");

  return (
    <div className="space-y-6">
      {/* Top Tag Metadata Header Card */}
      <Card padding="18px 22px" rounded="18px">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <IconWrapper
              icon={Cpu}
              variant="primary"
              sizeClassName="h-14 w-14 shrink-0"
              roundedClassName="rounded-[16px]"
              iconSize={30}
            />
            <div className="min-w-0 space-y-1">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-44 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ) : (
                <div>
                  <h2 className="m-0 text-[28px] font-black leading-tight text-(--theme-text-primary)">
                    {tagCode}
                  </h2>
                  <p className="m-0 mt-1 font-mono text-sm font-semibold text-(--theme-text-muted)">
                    {epcCode}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="success" size="md">
              {tagStatus}
            </Badge>
            <Badge variant="purple" size="md">
              {currentStatus}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <StatsRow overview={overviewData} tag={tagData} loading={loading} />

      {/* Tabs & Table/Grid Content */}
      <Card rounded="18px">
        <div className="flex items-center justify-between mb-2">
          <Tabs
            items={tabItems}
            onChange={handleTabChange}
            value={activeTab}
            equalWidth={false}
          />
        </div>

        {activeTab === TAB_SCAN_LOGS ? (
          <ScanLogsTable tagId={tagId} />
        ) : (
          <MappingHistory tagId={tagId} />
        )}
      </Card>
    </div>
  );
};

export default TagDetailIndex;
