import { usePageMeta } from "../../Hooks/usePageMeta";
import PrivacyPolicySection from "../../Section/landing/PrivacyPolicy";

const PrivacyPolicyPage = () => {
  usePageMeta({
    title: "Privacy Policy - Trackly",
    meta: [
      {
        name: "description",
        content:
          "Privacy Policy and data protection information for Trackly.",
      },
    ],
  });

  return <PrivacyPolicySection />;
};

export default PrivacyPolicyPage;
