import { Check, X } from "lucide-react";
import { useState } from "react";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Dropdown from "../../../Components/UI/Dropdown";
import Tabs from "../../../Components/UI/Tabs";

const FiltersSection = () => {
  const [viewingTab, setViewingTab] = useState("all");

  const viewingOptions = [
    { label: "All", value: "all" },
    { label: "Grand", value: "grand" },
    { label: "CityCare", value: "citycare" },
    { label: "Royal", value: "royal" },
    { label: "Metro", value: "metro" },
  ];

  return (
    <Card padding="16px">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-48">
          <Dropdown placeholder="Jun 23–29, 2026" options={[]} />
        </div>
        <div className="w-full sm:w-48">
          <Dropdown placeholder="All Linked Businesses" options={[]} />
        </div>
        <div className="w-full sm:w-40">
          <Dropdown placeholder="Batch Status" options={[]} />
        </div>
        <div className="w-full sm:w-40">
          <Dropdown placeholder="Category" options={[]} />
        </div>

        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <Button variant="primary" icon={Check} size="sm" className="flex-1 sm:flex-none">
            Apply Filters
          </Button>
          <Button variant="ghost" icon={X} size="sm" className="flex-1 sm:flex-none">
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-(--theme-border-soft) pt-4">
        <div className="w-full overflow-x-auto sm:w-auto">
          <Tabs
            items={viewingOptions}
            value={viewingTab}
            onChange={setViewingTab}
            rounded="20px"
            itemClassName="!min-h-8 !py-1 !text-[11px]"
          />
        </div>
      </div>
    </Card>
  );
};

export default FiltersSection;

