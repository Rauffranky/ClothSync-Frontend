import { usePageMeta } from "../../Hooks/usePageMeta";
import LaundryInvitation from "../../Section/Laundry/Invitation";

const pageMeta = [
  {
    name: "description",
    content: "Review and accept a ClothSync laundry invitation.",
  },
];

const LaundryInvitationPage = () => {
  usePageMeta({
    title: "Laundry Invitation - ClothSync",
    meta: pageMeta,
  });

  return <LaundryInvitation />;
};

export default LaundryInvitationPage;
