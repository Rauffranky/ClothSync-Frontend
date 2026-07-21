import { TriangleAlert } from "lucide-react";
import Alert from "../../../../Components/UI/Alert";
import DelayedItemsTable from "./DelayedItemsTable";
import DelayedTrendChart from "./DelayedTrendChart";

const DelayedItems = () => (
  <div className="space-y-5">
    <Alert
      leftIcon={<TriangleAlert aria-hidden="true" size={16} />}
      rounded="rounded-xl"
      size="sm"
      variant="orange"
    >
      <strong>31 items</strong> are currently past their expected return SLA.{" "}
      Items delayed beyond 72 hours should be investigated with the laundry
      partner.
    </Alert>
    <DelayedTrendChart />
    <DelayedItemsTable />
  </div>
);

export default DelayedItems;
