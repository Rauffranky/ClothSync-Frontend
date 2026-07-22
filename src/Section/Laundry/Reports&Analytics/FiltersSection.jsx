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
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* <div className="flex items-center gap-2 font-semibold text-(--theme-text-muted)">
          <Filter size={16} />
          <span className="text-sm">Filters:</span>
        </div> */}

        <div className="w-48">
          <Dropdown placeholder="Jun 23–29, 2026" options={[]} />
        </div>
        <div className="w-48">
          <Dropdown placeholder="All Linked Businesses" options={[]} />
        </div>
        <div className="w-40">
          <Dropdown placeholder="Batch Status" options={[]} />
        </div>
        <div className="w-40">
          <Dropdown placeholder="Category" options={[]} />
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="primary" icon={Check} size="sm">
            Apply Filters
          </Button>
          <Button variant="ghost" icon={X} size="sm">
            Reset
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-(--theme-border-soft) pt-4">
        {/* <span className="text-sm font-semibold text-(--theme-text-muted)">
          Viewing:
        </span> */}
        <div className="w-[500px]">
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
