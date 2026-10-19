import { usePageMeta } from "../../Hooks/usePageMeta";
import TermsAndConditionsSection from "../../Section/landing/TermsAndConditions";

const TermsAndConditionsPage = () => {
  usePageMeta({
    title: "Terms & Conditions - Trackly",
    meta: [
      {
        name: "description",
        content:
          "Terms & Conditions and platform usage policies for Trackly.",
      },
    ],
  });

  return <TermsAndConditionsSection />;
};

export default TermsAndConditionsPage;
