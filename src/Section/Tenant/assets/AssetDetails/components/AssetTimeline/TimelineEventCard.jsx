import {
  Building2,
  Clock,
  FileText,
  MapPin,
  Radio,
  ShieldCheck,
  Shirt,
  Truck,
  Tags,
} from "lucide-react";
import Alert from "../../../../../../Components/UI/Alert";
import Badge from "../../../../../../Components/UI/Badge";
import Card from "../../../../../../Components/UI/Card";
import IconWrapper from "../../../../../../Components/UI/IconWrapper";

const ICON_MAP = {
  "Asset Created": ShieldCheck,
  "In Business": Building2,
  "Sent to Laundry": Truck,
  "In Laundry": Shirt,
  "Sent to Business": Truck,
  "Returned to Business": Building2,
  "Re-Tagged": Radio,
  "Tag Linked": Radio,
  "Override Correction": ShieldCheck,
  "Category Changed": Tags,
  "Tag Changed": Radio,
};

const SPECIAL_EVENT_STYLES = {
  "Asset Created": {
    borderColor: "var(--asset-timeline-admin-border)",
    background: "var(--asset-timeline-admin-bg)",
    textColor: "var(--asset-timeline-admin-text)",
    mutedColor: "var(--asset-timeline-admin-muted)",
    noteBackground: "var(--asset-timeline-admin-note-bg)",
    noteBorderColor: "var(--asset-timeline-admin-border)",
  },
  "Re-Tagged": {
    borderColor: "var(--asset-timeline-admin-border)",
    background: "var(--asset-timeline-admin-bg)",
    textColor: "var(--asset-timeline-admin-text)",
    mutedColor: "var(--asset-timeline-admin-muted)",
    noteBackground: "var(--asset-timeline-admin-note-bg)",
    noteBorderColor: "var(--asset-timeline-admin-border)",
  },
  "Tag Linked": {
    borderColor: "var(--asset-timeline-linked-border)",
    background: "var(--asset-timeline-linked-bg)",
    textColor: "var(--asset-timeline-linked-text)",
    mutedColor: "var(--asset-timeline-linked-muted)",
    noteBackground: "var(--asset-timeline-linked-note-bg)",
    noteBorderColor: "var(--asset-timeline-linked-border)",
  },
  "Override Correction": {
    borderColor: "var(--asset-timeline-override-border)",
    background: "var(--asset-timeline-override-bg)",
    textColor: "var(--asset-timeline-override-text)",
    mutedColor: "var(--asset-timeline-override-muted)",
    noteBackground: "var(--asset-timeline-override-note-bg)",
    noteBorderColor: "var(--asset-timeline-override-note-border)",
  },
};

const TimelineField = ({ label, value, mono = false }) => {
  if (!value) return null;

  return (
    <div className="min-w-0 space-y-1">
      <div className="text-[10px] font-black uppercase tracking-wider text-(--theme-text-muted)">
        {label}
      </div>
      <div
        className={`truncate text-xs font-bold text-(--theme-text-primary) ${mono ? "font-mono" : ""}`}
      >
        {value}
      </div>
    </div>
  );
};

const TimelineEventCard = ({ event, isLast }) => {
  const Icon = ICON_MAP[event.title] || FileText;
  const specialStyle = SPECIAL_EVENT_STYLES[event.title];
  const cardStyle = specialStyle || {
    borderColor: "var(--asset-timeline-card-border)",
    background: "var(--asset-timeline-card-bg)",
  };

  return (
    <div className="grid grid-cols-[42px_1fr] gap-3">
      <div className="relative flex justify-center">
        <IconWrapper
          icon={Icon}
          variant={event.variant}
          sizeClassName="h-9 w-9"
          roundedClassName="rounded-full"
          iconSize={17}
        />
        {!isLast && (
          <span className="absolute top-10 -bottom-4.5 w-px bg-(--theme-border-soft)" />
        )}
      </div>

      <Card
        bg=""
        border="border border-solid"
        bodyStyle={
          specialStyle
            ? {
                "--theme-text-primary": specialStyle.textColor,
                "--theme-text-secondary": specialStyle.mutedColor,
                "--theme-text-muted": specialStyle.mutedColor,
                background: cardStyle.background,
              }
            : { background: cardStyle.background }
        }
        padding="14px 16px"
        rounded="14px"
        style={{
          borderColor: cardStyle.borderColor,
          boxShadow: "var(--asset-timeline-card-shadow)",
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-sm font-black text-(--theme-text-primary)">
                  {event.title}
                </h3>
                <Badge variant={event.variant} size="sm" dot>
                  {event.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold text-(--theme-text-muted)">
              <Clock size={13} />
              {event.date} - {event.time}
            </div>
          </div>

          {event.notes && (
            <Alert
              variant={event.variant === "warning" ? "warning" : "neutral"}
              size="sm"
              rounded="rounded-xl"
              style={
                specialStyle
                  ? {
                      background: specialStyle.noteBackground,
                      borderColor: specialStyle.noteBorderColor,
                      color: specialStyle.textColor,
                    }
                  : undefined
              }
            >
              {event.notes}
            </Alert>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TimelineField label="Location" value={event.location} />
            <TimelineField label="Scanner" value={event.scanner} />
            <TimelineField label="Scanner Code" value={event.scannerCode} mono />
            <TimelineField
              label="Type / Mode"
              value={[event.type, event.mode].filter(Boolean).join(" / ")}
            />
            <TimelineField label="Batch" value={event.batch} mono />
            <TimelineField label="Laundry" value={event.laundry} />
            <TimelineField label="Tag" value={event.tag} mono />
            <TimelineField label="Tag EPC" value={event.epc} mono />
            <TimelineField
              label="Category Change"
              value={event.oldCategory && event.newCategory ? `${event.oldCategory} → ${event.newCategory}` : null}
            />
            <TimelineField
              label="Tag Change"
              value={event.oldEpc && event.newEpc ? `${event.oldEpc} → ${event.newEpc}` : null}
              mono
            />
            <TimelineField label="Reason Code" value={event.reasonCode} />
            <TimelineField label="Correlation ID" value={event.correlationId} mono />
            <TimelineField
              label="Performed By"
              value={[event.performedBy, event.actorType].filter(Boolean).join(" · ")}
            />
            <TimelineField label="Status Change" value={event.transition} />
            <TimelineField
              label="Scan Session"
              value={[event.session, event.sessionStatus].filter(Boolean).join(" · ")}
              mono
            />
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-(--theme-text-muted)">
              <MapPin size={13} />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TimelineEventCard;
