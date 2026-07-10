import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, Clock3, Cuboid, Shirt } from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import Card from "../../../../Components/UI/Card";
import { getTenantCategoryDetails } from "../../../../axios/categories/tenantCategories";
import { getApiErrorMessage } from "../../../../axios/api";
import { toast } from "../../../../Utils/toast";
import { formatDate } from "../../../../Utils/date";

const normalizeDetails = (category) => {
  const status = String(category.status || "inactive").toLowerCase();
  const assets = Number(
    category.assetCount ?? category.assetsCount ?? category.totalMappedAssets ?? 0,
  );
  const isUsed = category.usageStatus
    ? String(category.usageStatus).toLowerCase() === "in use"
    : assets > 0;

  return {
    title:
      category.title ||
      category.name ||
      category.categoryName ||
      category.translations?.en?.title ||
      "Unnamed Category",
    description:
      category.description || category.translations?.en?.description || "No description provided.",
    status: status === "active" ? "Active" : "Inactive",
    usage: isUsed ? "In Use" : "Not in Use",
    assets,
    // washLimit: category.washLimit ?? category.maximumWashLimit ?? "-",
    created: formatDate(category.createdAt || category.created),
    updated: formatDate(category.updatedAt || category.lastUpdated),
  };
};

const CategoryDetails = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    getTenantCategoryDetails(id)
      .then((response) => {
        if (!isActive) return;
        const payload = response?.data ?? response;
        const details = payload?.item || payload?.category || payload;
        setCategory(normalizeDetails(details));
      })
      .catch((error) => {
        if (isActive) {
          toast.error(getApiErrorMessage(error, "Unable to load category details"));
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-28 rounded-2xl bg-(--button-ghost-bg)" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-24 rounded-2xl bg-(--button-ghost-bg)" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <Card>
        <p className="m-0 text-center font-semibold text-(--theme-text-muted)">
          Category details not found.
        </p>
      </Card>
    );
  }

  const summaryItems = [
    { label: "Total Mapped Assets", value: category.assets, icon: Cuboid, accent: true },
    // { label: "Wash Limit", value: category.washLimit, icon: RefreshCcw },
    { label: "Created", value: category.created, icon: CalendarDays },
    { label: "Last Updated", value: category.updated, icon: Clock3 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">Category Detail</h1>
        <p className="m-0 mt-1 text-sm font-semibold text-(--theme-text-muted)">
          Create and manage linen/asset categories for better inventory organization and reporting.
        </p>
      </div>

      <Card padding="18px 22px" rounded="18px">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-purple-300/40 bg-purple-500/10 text-purple-500">
              <Shirt size={27} />
            </span>
            <div className="min-w-0">
              <h2 className="m-0 truncate text-xl font-black text-(--theme-text-primary)">
                {category.title}
              </h2>
              <p className="m-0 mt-1 text-xs font-semibold text-(--theme-text-muted)">
                {category.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge size="sm" variant={category.status === "Active" ? "success" : "neutral"}>
              {category.status}
            </Badge>
            <Badge size="sm" variant="purple">
              {category.usage}
            </Badge>
          </div>
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} padding="16px 18px" rounded="14px">
              <div className="flex items-center gap-2 text-(--theme-text-muted)">
                <Icon size={14} />
                <p className="m-0 text-[10px] font-black uppercase tracking-[0.08em]">
                  {item.label}
                </p>
              </div>
              <p
                className="m-0 mt-2 text-sm font-black"
                style={{ color: item.accent ? "#9333ea" : "var(--theme-text-primary)" }}
              >
                {item.value}
              </p>
            </Card>
          );
        })}
      </section>
    </div>
  );
};

export default CategoryDetails;
