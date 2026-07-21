
import { usePageMeta } from "../../../Hooks/usePageMeta";
import ReportsAnalytics from "../../../Section/Tenant/Report&Analytics";

const ReportAnalyticsPage = () => {
    usePageMeta({
        title: "Report & Analytics - ClothSync",
        meta: [
            {
                name: "description",
                content: "View specific laundry relationship details and activity in the ClothSync business portal.",
            },
        ],
    });

    return (
        <div>
            <ReportsAnalytics />
        </div>
    );
};

export default ReportAnalyticsPage;
