import { usePageMeta } from "../../../Hooks/usePageMeta";
import TermsAndConditions from "../../../Section/SuperAdmin/TermsAndConditions";

const TermsAndConditionsPage = () => {
  usePageMeta({
    title: "Terms & Conditions - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage terms and conditions for the ClothSync platform.",
      },
    ],
  });

  return (
    <div>
      <TermsAndConditions />
    </div>
  );
};

export default TermsAndConditionsPage;
