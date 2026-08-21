import { useEffect, useState } from "react";
import Alert from "../../../../../../Components/UI/Alert";
import Button from "../../../../../../Components/UI/Button";
import Card from "../../../../../../Components/UI/Card";
import CardSkeleton from "../../../../../../Components/UI/CardSkeleton";
import Pagination from "../../../../../../Components/UI/Pagination";
import { getApiErrorMessage } from "../../../../../../axios/api";
import { getTenantAssetLifecycleHistory } from "../../../../../../axios/assets/tenantAssets";
import { formatDate, formatTimeWithUserPreferences } from "../../../../../../Utils/date";
import { formatStatusLabel } from "../../../../../../Utils/status";
import TimelineEventCard from "./TimelineEventCard";

const ITEMS_PER_PAGE = 20;

const statusVariants = {
  in_business: "success",
  sent_to_laundry: "warning",
  at_laundry: "purple",
  washed: "info",
  returned: "info",
  delayed: "danger",
  missing: "danger",
  created: "neutral",
  asset_created: "neutral",
  retagged: "purple",
  re_tagged: "purple",
  override_correction: "warning",
  linked: "success",
  tag_linked: "info",
  category_changed: "warning",
};

const normalizeLifecycleEvent = (record = {}, index = 0) => {
  const scanner = record.scanner || record.scannerDetails || {};
  const batch = record.batch || record.dispatchBatch || record.laundryBatch || {};
  const laundry = record.laundry || batch.laundry || batch.laundryLink?.laundry || record.assignedLaundry || {};
  const tag = record.tag || {};
  const oldTag = record.oldTag || {};
  const newTag = record.newTag || {};
  const metadata = record.metadata || {};
  const performedBy = record.performedBy || record.operator || {};
  const scanSession = record.scanSession || {};
  const eventKey = String(record.eventType || record.action || record.type || record.status || "activity").toLowerCase();
  const isCategoryChanged = eventKey === "category_changed";
  const isTagChanged = ["retagged", "re_tagged", "tag_changed", "tag-change"].includes(eventKey);
  const eventAt = record.occurredAt || record.eventAt || record.scannedAt || record.createdAt || record.updatedAt;
  return {
    id: record.id || record._id || `${eventKey}-${eventAt || index}`,
    title: isCategoryChanged ? "Category Changed" : isTagChanged ? "Tag Changed" : (record.title || record.eventLabel || formatStatusLabel(eventKey)),
    status: record.statusLabel || formatStatusLabel(record.status || record.eventType || record.action),
    variant: statusVariants[record.status] || statusVariants[eventKey] || "neutral",
    date: formatDate(eventAt),
    time: formatTimeWithUserPreferences(eventAt),
    location: record.location || record.scanLocation || record.zoneName || scanner.zoneName || "—",
    scanner: scanner.scannerName || scanner.name || record.scannerName || null,
    scannerCode: scanner.scannerCode || scanner.scannerId || record.scannerCode || null,
    type: scanner.scannerType || record.scannerType || null,
    mode: scanner.scannerMode || record.scannerMode || record.mode || null,
    batch: batch.batchCode || batch.code || record.batchCode || null,
    laundry: laundry.companyName || laundry.businessName || laundry.name || record.laundryName || null,
    tag: tag.tagCode || null,
    epc: tag.epc || metadata.epc || null,
    oldEpc: oldTag.epc || null,
    newEpc: newTag.epc || null,
    oldCategory: metadata.oldCategory?.name || null,
    newCategory: metadata.newCategory?.name || null,
    reasonCode: record.reasonCode || null,
    correlationId: metadata.correlationId || record.correlationId || null,
    performedBy: performedBy.fullName || performedBy.name || null,
    actorType: formatStatusLabel(record.actorType, null),
    transition: record.fromStatus || record.toStatus
      ? `${formatStatusLabel(record.fromStatus, "Start")} → ${formatStatusLabel(record.toStatus)}`
      : null,
    session: scanSession.id || record.scanSessionId || null,
    sessionStatus: scanSession.status ? formatStatusLabel(scanSession.status) : null,
    notes: record.notes || record.description || record.message || record.reason || null,
  };
};

const normalizeLifecycleResponse = (response = {}) => {
  const payload = response?.data ?? response ?? {};
  const items = payload.items || payload.lifecycleHistory || payload.history || payload.events || payload.docs || payload.results || [];
  const pagination = payload.pagination || payload.meta || {};
  const totalItems = Number(pagination.totalItems ?? pagination.total ?? payload.totalItems ?? items.length) || 0;
  return {
    events: Array.isArray(items) ? items.map(normalizeLifecycleEvent) : [],
    totalItems,
    totalPages: Number(pagination.totalPages ?? pagination.pages ?? Math.ceil(totalItems / ITEMS_PER_PAGE)) || 0,
  };
};

const AssetTimelineTab = ({ data }) => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    // Loading synchronizes the timeline with the selected server-side history page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setLoadError("");
    getTenantAssetLifecycleHistory(data.apiId || data.id, {
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
    })
      .then((response) => {
        if (!isActive) return;
        const history = normalizeLifecycleResponse(response);
        setEvents(history.events);
        setPageCount(history.totalPages);
        setTotalItems(history.totalItems);
      })
      .catch((error) => {
        if (!isActive) return;
        setEvents([]);
        setPageCount(0);
        setTotalItems(0);
        setLoadError(getApiErrorMessage(error, "Unable to load asset timeline"));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [currentPage, data.apiId, data.id, retryKey]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((item) => <CardSkeleton key={item} lines={4} />)}
      </div>
    );
  }

  return (
    <>
      {loadError && (
        <Alert className="mb-4" variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button onClick={() => setRetryKey((current) => current + 1)} size="sm" variant="outline">
              Try Again
            </Button>
          </div>
        </Alert>
      )}
      <Card bodyClassName="space-y-5">
        {events.length > 0 ? events.map((event, index) => (
          <TimelineEventCard
            event={event}
            isLast={index === events.length - 1}
            key={event.id}
          />
        )) : !loadError ? (
          <div className="flex min-h-40 items-center justify-center text-sm font-semibold text-(--theme-text-muted)">
            No lifecycle history found
          </div>
        ) : null}
      </Card>
      <Pagination
        forcePage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={({ selected }) => setCurrentPage(selected)}
        pageCount={pageCount}
        totalItems={totalItems}
      />
    </>
  );
};

export default AssetTimelineTab;
