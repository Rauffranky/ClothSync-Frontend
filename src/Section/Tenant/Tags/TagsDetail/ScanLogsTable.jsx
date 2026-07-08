import { Building2, Settings2 } from "lucide-react";
import Table from "../../../../Components/UI/Table";
import Badge from "../../../../Components/UI/Badge";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import { useSortableTableData } from "../../../../Hooks/useSortableTableData";

const logsData = [
    {
        id: "1",
        tagId: { text: "TAG-001" },
        assets: { name: "King Duvet Cover", sub: "LNS-BED-0041" },
        location: "Chicago, IL",
        mode: "Automatic",
        batch: "BTH-20240\n611-001",
        itemsSent: "229",
        delayed: "8",
        lastActivity: "2 min ago"
    },
    {
        id: "2",
        tagId: { icon: Building2, name: "CleanFlow Solutions", sub: "LND-002" },
        assets: { name: "Sarah Okafor", sub: "sarah@cleanflow.io" },
        location: "Evanston, IL",
        mode: "Manual",
        batch: "1",
        itemsSent: "88",
        delayed: "1",
        lastActivity: "1 hr ago"
    },
    {
        id: "3",
        tagId: { icon: Building2, name: "Metro Linen Services", sub: "LND-003" },
        assets: { name: "Tom Hayashi", sub: "tom@metrolinen.com" },
        location: "Oak Park, IL",
        hasSet: true,
        mode: "Automatic",
        batch: "2",
        itemsSent: "65",
        delayed: "—",
        lastActivity: "3 hrs ago"
    },
    {
        id: "4",
        tagId: { icon: Building2, name: "Riverside Linen Works", sub: "LND-006" },
        assets: { name: "Lisa Petrov", sub: "lisa@riverlinens.net" },
        location: "Joliet, IL",
        hasSet: true,
        mode: "Manual",
        batch: "0",
        itemsSent: "0",
        delayed: "—",
        lastActivity: "Suspended"
    }
];

const columns = [
    {
        key: "tagId",
        label: "TAG ID",
        sortable: true,
        render: (_, row) => {
            if (row.tagId.text) {
                return <span className="font-mono text-sm font-black text-(--theme-text-primary)">{row.tagId.text}</span>;
            }
            return (
                <div className="flex min-w-0 items-center gap-3">
                    <IconWrapper
                        icon={row.tagId.icon}
                        variant="info"
                        sizeClassName="h-9 w-9 shrink-0"
                        roundedClassName="rounded-xl"
                        iconSize={16}
                    />
                    <div className="min-w-0">
                        <p className="m-0 truncate text-sm font-bold text-(--theme-text-primary)">
                            {row.tagId.name}
                        </p>
                        <p className="m-0 mt-0.5 font-mono text-[11px] font-semibold text-(--theme-text-muted)">
                            {row.tagId.sub}
                        </p>
                    </div>
                </div>
            );
        },
    },
    {
        key: "assets",
        label: "ASSETS",
        sortable: true,
        render: (_, row) => (
            <div className="min-w-0">
                <p className="m-0 truncate text-sm font-bold text-(--theme-text-primary)">
                    {row.assets.name}
                </p>
                <p className={`m-0 mt-0.5 font-mono text-[11px] font-semibold ${row.assets.sub.includes('@') ? 'text-(--theme-text-muted)' : 'text-(--color-sky-blue)'}`}>
                    {row.assets.sub}
                </p>
            </div>
        ),
    },
    {
        key: "location",
        label: "LOCATION",
        sortable: true,
        render: (_, row) => {
            const parts = row.location.split(", ");
            return (
                <div className="text-sm font-medium text-(--theme-text-secondary)">
                    {parts[0]},<br />{parts[1]}
                </div>
            );
        }
    },
    {
        key: "mode",
        label: "MODE",
        sortable: true,
        render: (_, row) => (
            <div className="flex items-center gap-3">
                {row.hasSet && (
                    <Badge variant="neutral" size="sm" leftIcon={<Settings2 size={12} />}>
                        Set
                    </Badge>
                )}
                <Badge variant={row.mode === 'Automatic' ? 'info' : 'neutral'} size="sm">
                    {row.mode}
                </Badge>
            </div>
        ),
    },
    {
        key: "batch",
        label: "BATCHE",
        sortable: true,
        render: (_, row) => (
            <div className="text-sm font-bold whitespace-pre-line text-(--color-sky-blue)">
                {row.batch}
            </div>
        ),
    },
    {
        key: "itemsSent",
        label: "ITEMS SENT",
        sortable: true,
        render: (_, row) => (
            <span className="text-sm font-black text-(--theme-text-primary)">{row.itemsSent}</span>
        ),
    },
    {
        key: "delayed",
        label: "DELAYED",
        sortable: true,
        render: (_, row) => (
            <span className={`text-sm font-bold ${row.delayed !== "—" ? "text-(--color-overdue)" : "text-(--theme-text-muted)"}`}>
                {row.delayed}
            </span>
        ),
    },
    {
        key: "lastActivity",
        label: "LAST ACTIVITY",
        sortable: true,
        render: (_, row) => (
            <span className="text-xs font-bold text-(--theme-text-muted)">{row.lastActivity}</span>
        ),
    }
];

const ScanLogsTable = () => {
    const { handleSort, sortedData, sortBy, sortDirection } = useSortableTableData(logsData);

    return (
        <div className="p-4 overflow-x-auto">
            <Table
                columns={columns}
                data={sortedData}
                emptyText="No scan logs found"
                rowKey="id"
                onSort={handleSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
            />
        </div>
    );
};

export default ScanLogsTable;
