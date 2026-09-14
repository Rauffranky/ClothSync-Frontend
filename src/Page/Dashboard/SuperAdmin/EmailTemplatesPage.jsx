import { usePageMeta } from "../../../Hooks/usePageMeta";
import EmailTemplatesSection from "../../../Section/SuperAdmin/EmailTemplates";

const EmailTemplatesPage = () => {
  usePageMeta({
    title: "Email Templates - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage system email templates for the ClothSync platform.",
      },
    ],
  });

  return (
    <div>
      <EmailTemplatesSection />
    </div>
  );
};

export default EmailTemplatesPage;
