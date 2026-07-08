import { Cpu, History, Logs } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Card from "../../../../Components/UI/Card";
import Badge from "../../../../Components/UI/Badge";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Tabs from "../../../../Components/UI/Tabs";
import ScanLogsTable from "./ScanLogsTable";
import StatsRow from "./StatsRow";
import MappingHistory from "./MappingHistory";

const TAB_SCAN_LOGS = "scan-logs";
const TAB_MAPPING_HISTORY = "mapping-history";

const TagDetailIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  return (
    <div className="space-y-6">
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
              <div>
                <h2 className="m-0 text-[28px] font-black leading-tight text-(--theme-text-primary)">
                  Tag-001
                </h2>
                <p className="m-0 mt-1 font-mono text-sm font-semibold text-(--theme-text-muted)">
                  E2800189200040D6
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="success" size="md">
              Active
            </Badge>
            <Badge variant="purple" size="md">
              In Laundry
            </Badge>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <StatsRow />

      <Card rounded="18px">
        <div className="flex items-center justify-between mb-2">
          <Tabs items={tabItems} onChange={handleTabChange} value={activeTab} />
        </div>

        {activeTab === TAB_SCAN_LOGS ? <ScanLogsTable /> : <MappingHistory />}
      </Card>
    </div>
  );
};

export default TagDetailIndex;
