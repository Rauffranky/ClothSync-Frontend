import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Cuboid,
  Eye,
  RefreshCcw,
  Shirt,
  Tag as TagIcon,
} from "lucide-react";
import Alert from "../../../../Components/UI/Alert";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import CardSkeleton from "../../../../Components/UI/CardSkeleton";
import Table from "../../../../Components/UI/Table";
import { getApiErrorMessage } from "../../../../axios/api";
import { getTenantCategoryDetails } from "../../../../axios/categories/tenantCategories";
import { formatDateTime, formatDateWithUserPreferences } from "../../../../Utils/date";
import { formatStatusLabel } from "../../../../Utils/status";

const STATUS_VARIANTS = {
  active: "success",
  inactive: "neutral",
  retired: "danger",
  in_business: "success",
  sent_to_laundry: "warning",
  at_laundry: "purple",
  washed: "info",
  sent_to_business: "info",
  returned: "success",
  linked: "success",
  unlinked: "warning",
};

const normalizeCategoryDetails = (response = {}) => {
  const payload = response?.data ?? response ?? {};
  const category = payload.item || payload.category || payload;
  const overview = category.overview || {};

  return {
    code: category.categoryCode || category.code || "—",
    title: category.title || category.translations?.en?.title || "Unnamed Category",
    description: category.description || category.translations?.en?.description || "No description provided.",
    status: category.status || "inactive",
    statusLabel: category.statusLabel || formatStatusLabel(category.status),
    usage: category.usage || (Number(category.totalMappedAssets) > 0 ? "in use" : "not in use"),
    created: formatDateWithUserPreferences(overview.createdAt || category.createdAt),
    updated: formatDateWithUserPreferences(overview.lastUpdatedAt || category.updatedAt),
    overview: {
      totalMappedAssets: Number(overview.totalMappedAssets ?? category.totalMappedAssets ?? 0) || 0,
      washLimit: overview.washLimit ?? "—",
    },
    recentAssets: Array.isArray(category.recentAssets)
      ? category.recentAssets.map((asset) => {
          const tag = asset.tag || asset.tags?.[0] || {};
          const laundry = asset.assignedLaundry || asset.assignedLaundryLink?.laundry || {};
          return {
            id: asset.id || asset._id,
            tagId: asset.tagId || tag.id || tag._id,
            assetCode: asset.assetCode || asset.code || "—",
            assetName: asset.assetName || asset.name || "—",
            tagCode: asset.tagCode || tag.tagCode || "—",
            epc: tag.epc || "—",
            zone: asset.zoneName || "—",
            laundry: laundry.companyName || laundry.businessName || laundry.name || "—",
            laundryContact: laundry.contactPersonName || laundry.fullName || "—",
            status: asset.statusLabel || formatStatusLabel(asset.status),
            statusVariant: STATUS_VARIANTS[asset.status] || "neutral",
            assetWashCount: Number(asset.assetWashCount ?? asset.washCount ?? 0) || 0,
            tagWashCount: Number(asset.tagWashCount ?? tag.totalLaundryCycles ?? 0) || 0,
            washCountMatches: asset.washCountMatchesTag !== false,
            washLimit: asset.washLimit ?? tag.washLimit,
            tagStatus: formatStatusLabel(tag.tagStatus || "—"),
            tagStatusVariant: STATUS_VARIANTS[tag.tagStatus] || "neutral",
            mappingStatus: formatStatusLabel(tag.mappingStatus || "—"),
            mappingStatusVariant: STATUS_VARIANTS[tag.mappingStatus] || "neutral",
            linkedDate: formatDateWithUserPreferences(asset.linkedDate || tag.linkedDate || tag.linkedAt),
            lastScan: formatDateTime(asset.lastScannedAt),
            lastScanLocation: asset.lastScanLocation || "—",
          };
        })
      : [],
  };
};

const CategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setLoadError("");
    getTenantCategoryDetails(id)
      .then((response) => {
        if (isActive) setCategory(normalizeCategoryDetails(response));
      })
      .catch((error) => {
        if (!isActive) return;
        setCategory(null);
        setLoadError(getApiErrorMessage(error, "Unable to load category details"));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id, retryKey]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton lines={3} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} lines={2} />)}
        </div>
        <CardSkeleton lines={5} />
      </div>
    );
  }

  if (loadError || !category) {
    return (
      <Alert variant="danger">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{loadError || "Category details not found"}</span>
          <Button variant="outline" onClick={() => setRetryKey((value) => value + 1)}>Try Again</Button>
        </div>
      </Alert>
    );
  }

  const summaryItems = [
    { label: "Total Mapped Assets", value: category.overview.totalMappedAssets, icon: Cuboid, accent: true },
    { label: "Wash Limit", value: category.overview.washLimit, icon: RefreshCcw },
    { label: "Created", value: category.created, icon: CalendarDays },
    { label: "Last Updated", value: category.updated, icon: Clock3 },
  ];

  const columns = [
    {
      label: "ASSET",
      accessor: "assetCode",
      width: 220,
      render: (_, row) => (
        <div className="min-w-48">
          <div className="font-black text-(--theme-text-primary)">{row.assetName}</div>
          <div className="mt-1 font-mono text-xs font-semibold text-(--theme-text-muted)">{row.assetCode}</div>
          <div className="mt-1 text-xs text-(--theme-text-muted)">{row.zone}</div>
        </div>
      ),
    },
    {
      label: "RFID TAG",
      accessor: "tagCode",
      width: 280,
      render: (_, row) => (
        <div className="min-w-64 space-y-1.5">
          <div className="font-bold text-(--color-sky-blue)">{row.tagCode}</div>
          <div className="font-mono text-xs text-(--theme-text-muted)">{row.epc}</div>
          <div className="flex flex-wrap gap-1.5">
            <Badge size="sm" variant={row.tagStatusVariant}>{row.tagStatus}</Badge>
            <Badge size="sm" variant={row.mappingStatusVariant}>{row.mappingStatus}</Badge>
          </div>
        </div>
      ),
    },
    {
      label: "ASSIGNED LAUNDRY",
      accessor: "laundry",
      width: 210,
      render: (_, row) => (
        <div className="min-w-44">
          <div className="font-semibold text-(--theme-text-primary)">{row.laundry}</div>
          <div className="mt-1 text-xs text-(--theme-text-muted)">{row.laundryContact}</div>
        </div>
      ),
    },
    { label: "STATUS", accessor: "status", width: 150, render: (value, row) => <Badge size="sm" variant={row.statusVariant}>{value}</Badge> },
    {
      label: "WASH TRACKING",
      accessor: "assetWashCount",
      width: 180,
      render: (_, row) => (
        <div className="min-w-36">
          <div className="font-black text-(--theme-text-primary)">Asset {row.assetWashCount}{row.washLimit != null ? ` / ${row.washLimit}` : ""}</div>
          <div className={`mt-1 text-xs font-semibold ${row.washCountMatches ? "text-(--badge-ready-text)" : "text-(--color-overdue)"}`}>Tag {row.tagWashCount} · {row.washCountMatches ? "Matched" : "Mismatch"}</div>
        </div>
      ),
    },
    {
      label: "DATES & LOCATION",
      accessor: "lastScan",
      width: 250,
      render: (_, row) => (
        <div className="min-w-56 space-y-1 text-xs font-semibold text-(--theme-text-secondary)">
          <div>Linked: {row.linkedDate}</div>
          <div>Scanned: {row.lastScan}</div>
          <div className="text-(--theme-text-muted)">Location: {row.lastScanLocation}</div>
        </div>
      ),
    },
    {
      label: "ACTIONS",
      key: "actions",
      sortable: false,
      align: "right",
      width: 190,
      render: (_, row) => (
        <div className="flex min-w-40 justify-end gap-1.5">
          <Button disabled={!row.id} leftIcon={<Eye size={13} />} size="sm" variant="outline" onClick={() => navigate(`/business/assets/${row.id}`)}>Asset</Button>
          <Button disabled={!row.tagId} leftIcon={<TagIcon size={13} />} size="sm" variant="outline" onClick={() => navigate(`/business/tags/${row.tagId}`)}>Tag</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">Category Detail</h1>
        <p className="m-0 mt-1 text-sm font-semibold text-(--theme-text-muted)">Category overview, asset usage and mapped RFID tags.</p>
      </div>

      <Card padding="18px 22px" rounded="18px">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-purple-300/40 bg-purple-500/10 text-purple-500"><Shirt size={27} /></span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="m-0 text-xl font-black text-(--theme-text-primary)">{category.title}</h2>
                <span className="font-mono text-xs font-bold text-(--theme-text-muted)">{category.code}</span>
              </div>
              <p className="m-0 mt-1 text-xs font-semibold text-(--theme-text-muted)">{category.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge size="sm" variant={STATUS_VARIANTS[category.status] || "neutral"}>{category.statusLabel}</Badge>
            <Badge size="sm" variant="purple">{formatStatusLabel(category.usage)}</Badge>
          </div>
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map(({ icon: Icon, ...item }) => (
          <Card key={item.label} padding="16px 18px" rounded="14px">
            <div className="flex items-center gap-2 text-(--theme-text-muted)"><Icon size={14} /><p className="m-0 text-[10px] font-black uppercase tracking-[0.08em]">{item.label}</p></div>
            <p className="m-0 mt-2 text-xl font-black" style={{ color: item.accent ? "var(--color-aurora-teal)" : "var(--theme-text-primary)" }}>{item.value}</p>
          </Card>
        ))}
      </section>

      <Card padding="18px" rounded="18px">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h3 className="m-0 text-lg font-black text-(--theme-text-primary)">Assets</h3><p className="m-0 mt-1 text-xs font-semibold text-(--theme-text-muted)">Assets currently mapped to this category.</p></div>
          <Badge variant="info" size="sm">{category.recentAssets.length}</Badge>
        </div>
        <Table
          columns={columns}
          data={category.recentAssets}
          emptyText="No assets mapped to this category"
          rowKey="id"
          tableClassName="min-w-[1480px]"
        />
      </Card>
    </div>
  );
};

export default CategoryDetails;
