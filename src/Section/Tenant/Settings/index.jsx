import { useSearchParams } from "react-router-dom";
import Card from "../../../Components/UI/Card";
import Tabs from "../../../Components/UI/Tabs";
import GeneralTab from "./GeneralTab";
import NotificationsTab from "./NotificationsTab";
import SecurityTab from "./SecurityTab";
import { settingsTabs } from "./data";

const tabItems = settingsTabs.map(({ icon: Icon, ...tab }) => ({
  ...tab,
  icon: <Icon size={18} />,
}));
const tabValues = settingsTabs.map((tab) => tab.value);

const TenantSettings = ({
  generalTabProps,
  notificationTabProps,
  securityTabProps,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = tabValues.includes(requestedTab)
    ? requestedTab
    : "general";

  const handleTabChange = (nextTab) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (nextTab === "general") {
        nextParams.delete("tab");
      } else {
        nextParams.set("tab", nextTab);
      }

      return nextParams;
    }, { replace: true });
  };

  return (
    <section className="space-y-5">
      <Card padding="0" rounded="20px" className="overflow-hidden">
        <div className="hide-scrollbar overflow-x-auto border-b border-(--theme-border-soft) p-3">
          <Tabs
            className="w-max border-0 shadow-none"
            itemClassName="whitespace-nowrap"
            items={tabItems}
            onChange={handleTabChange}
            value={activeTab}
          />
        </div>

        <div
          className="space-y-7 p-4 sm:p-7"
          id={`settings-panel-${activeTab}`}
        >
          {activeTab === "general" && <GeneralTab {...generalTabProps} />}
          {activeTab === "notifications" && (
            <NotificationsTab {...notificationTabProps} />
          )}
          {activeTab === "security" && <SecurityTab {...securityTabProps} />}
        </div>
      </Card>
    </section>
  );
};

export default TenantSettings;
