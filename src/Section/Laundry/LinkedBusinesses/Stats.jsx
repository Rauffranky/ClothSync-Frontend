import { Boxes, Building2, CircleCheck, Clock3, Truck } from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";

const stats = [
  {
    key: "totalLinked",
    label: "Total Linked",
    icon: Building2,
    variant: "info",
  },
  {
    key: "activeBusinesses",
    label: "Active Businesses",
    icon: CircleCheck,
    variant: "success",
  },
  {
    key: "pendingRequests",
    label: "Pending Requests",
    icon: Clock3,
    variant: "warning",
  },
  {
    key: "activeBatches",
    label: "Active Batches",
    icon: Truck,
    variant: "info",
  },
  {
    key: "itemsInLaundry",
    label: "Items In Laundry",
    icon: Boxes,
    variant: "purple",
  },
];

const LinkedBusinessStats = ({ loading = false, summary = null }) => (
  <section className="grid gap-2 sm:grid-cols-4 lg:grid-cols-5">
    {stats.map((item) =>
      loading ? (
        <CardSkeleton key={item.key} />
      ) : (
        <Card key={item.key} padding="16px">
          <IconWrapper icon={item.icon} variant={item.variant} />
          <p className="m-0 mt-4 text-3xl font-black leading-none text-(--theme-text-primary)">
            {summary?.[item.key] ?? "-"}
          </p>
          <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-muted)">
            {item.label}
          </p>
        </Card>
      ),
    )}
  </section>
);

export default LinkedBusinessStats;
