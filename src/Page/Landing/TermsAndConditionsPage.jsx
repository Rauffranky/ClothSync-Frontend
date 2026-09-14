import { usePageMeta } from "../../Hooks/usePageMeta";
import TermsAndConditionsSection from "../../Section/landing/TermsAndConditions";

const TermsAndConditionsPage = () => {
  usePageMeta({
    title: "Terms & Conditions - RFID Laundry Management System",
    meta: [
      {
        name: "description",
        content:
          "Official Terms & Conditions and usage policies for the ClothSync RFID Laundry Management System platform.",
      },
    ],
  });

  return <TermsAndConditionsSection />;
};

export default TermsAndConditionsPage;
