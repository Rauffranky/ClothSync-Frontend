import { usePageMeta } from "../../Hooks/usePageMeta";
import PrivacyPolicySection from "../../Section/landing/PrivacyPolicy";

const PrivacyPolicyPage = () => {
  usePageMeta({
    title: "Privacy Policy - RFID Laundry Management System",
    meta: [
      {
        name: "description",
        content:
          "Official Privacy Policy and data protection standards for the ClothSync RFID Laundry Management System platform.",
      },
    ],
  });

  return <PrivacyPolicySection />;
};

export default PrivacyPolicyPage;
