import { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import Dropdown from "../../../Components/UI/Dropdown";
import Button from "../../../Components/UI/Button";
import { getTenantCategories } from "../../../axios/categories/tenantCategories";
import { getTenantLaundries } from "../../../axios/laundries/tenantLaundries";

const dateOptions = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "3m" },
  { label: "Last 6 months", value: "6m" },
  { label: "This Year", value: "1y" },
];

const ReportsFilters = ({ filters, onFilter }) => {
  const [laundryOptions, setLaundryOptions] = useState([{ label: "All Laundries", value: "all" }]);
  const [categoryOptions, setCategoryOptions] = useState([{ label: "All Categories", value: "all" }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getTenantCategories({ status: "active", optionsOnly: true }),
      getTenantLaundries({ optionsOnly: true }),
    ]).then(([categoryResponse, laundryResponse]) => {
      if (!active) return;
      const getItems = (response, keys) => {
        const payload = response?.data?.data ?? response?.data ?? response ?? {};
        return keys.map((key) => payload?.[key]).find(Array.isArray) || [];
      };
      setCategoryOptions([{ label: "All Categories", value: "all" }, ...getItems(categoryResponse, ["items", "categories", "docs"]).map((item) => ({ label: item.title || item.name || "Unnamed Category", value: item.id || item._id })).filter((item) => item.value)]);
      setLaundryOptions([{ label: "All Laundries", value: "all" }, ...getItems(laundryResponse, ["items", "laundries", "docs"]).map((item) => ({ label: item.laundry?.name || item.businessName || item.companyName || item.name || "Unnamed Laundry", value: item.id || item._id })).filter((item) => item.value)]);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
  <div className="flex flex-wrap items-center gap-4">
    {/* Date filter */}
    <Dropdown
      options={dateOptions}
      value={filters.date}
      onChange={(val) => onFilter("date", val)}
      placeholder="Date"
      width="w-44"
    />

    {/* Laundry filter */}
    <Dropdown
      disabled={loading}
      options={laundryOptions}
      value={filters.laundry}
      onChange={(val) => onFilter("laundry", val)}
      placeholder="Laundries"
      width="w-48"
    />

    {/* Category filter */}
    <Dropdown
      disabled={loading}
      options={categoryOptions}
      value={filters.category}
      onChange={(val) => onFilter("category", val)}
      placeholder="Categories"
      width="w-48"
    />

    {/* Spacer */}
    <div className="flex-1" />

    {/* Quick export */}
    {/* <span
      className="text-xs font-semibold"
      style={{ color: "var(--theme-text-muted)" }}
    >
      Quick export:
    </span> */}
    {["CSV", "XLSX"].map((fmt) => (
      <Button
        key={fmt}
        variant="ghost"
        size="md"
        leftIcon={<FileDown size={15} />}
      >
        {fmt}
      </Button>
    ))}
  </div>
  );
};

export default ReportsFilters;
