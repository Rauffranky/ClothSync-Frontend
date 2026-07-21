import { CircleAlert } from "lucide-react";
import Alert from "../../../../Components/UI/Alert";
import MissingCategoryChart from "./MissingCategoryChart";
import MissingLostTable from "./MissingLostTable";
import StatusBreakdownChart from "./StatusBreakdownChart";

const MissingLost = () => (
  <div className="space-y-5">
    <Alert
      leftIcon={<CircleAlert aria-hidden="true" size={16} />}
      rounded="rounded-xl"
      size="sm"
      variant="danger"
    >
      <strong>11 items</strong> are missing or suspected lost. <strong>1 item</strong>{" "}
      has been confirmed lost. Investigate open missing items before they are
      written off.
    </Alert>

    <div className="grid gap-5 lg:grid-cols-2">
      <MissingCategoryChart />
      <StatusBreakdownChart />
    </div>

    <MissingLostTable />
  </div>
);

export default MissingLost;
