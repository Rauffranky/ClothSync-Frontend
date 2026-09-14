import { usePageMeta } from "../../../Hooks/usePageMeta";
import ReportsAnalytics from "../../../Section/Laundry/Reports&Analytics";

const ReportAnalyticsPage = () => {
  usePageMeta({
    title: "Report & Analytics - ClothSync",
    meta: [
      {
        name: "description",
        content: "View reports and analytics for laundry processing in ClothSync.",
      },
    ],
  });

  return <ReportsAnalytics />;
};

export default ReportAnalyticsPage;
