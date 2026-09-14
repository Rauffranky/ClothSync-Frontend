import { usePageMeta } from "../../../Hooks/usePageMeta";
import PrivacyPolicy from "../../../Section/SuperAdmin/PrivacyPolicy";

const PrivacyPolicyPage = () => {
  usePageMeta({
    title: "Privacy Policy - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage privacy policy for the ClothSync platform.",
      },
    ],
  });

  return (
    <div>
      <PrivacyPolicy />
    </div>
  );
};

export default PrivacyPolicyPage;
