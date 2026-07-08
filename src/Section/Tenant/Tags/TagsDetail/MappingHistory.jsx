import { Link2 } from "lucide-react";
import Card from "../../../../Components/UI/Card";

const mappingHistoryData = [
  {
    id: "MAP-001",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-002",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-003",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-004",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-005",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-006",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-007",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
  {
    id: "MAP-008",
    title: "Mapped — LNS-BED-0099 — Pillow Case Set",
    author: "Maria Santos",
    date: "Jan 14, 2025",
  },
];

const MappingHistory = () => {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        {mappingHistoryData.map((item) => (
          <Card key={item.id} padding="0" rounded="16px">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[rgba(20,184,166,0.18)] bg-[rgba(20,184,166,0.08)] text-(--color-aurora-teal)">
                <Link2 size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-bold text-(--theme-text-primary)">
                  {item.title}
                </p>
                <p className="m-0 mt-0.5 text-xs font-medium text-(--theme-text-muted)">
                  by {item.author}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="m-0 text-xs font-semibold text-(--theme-text-muted)">
                  {item.date}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MappingHistory;
