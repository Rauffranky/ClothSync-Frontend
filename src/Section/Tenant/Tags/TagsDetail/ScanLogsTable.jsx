import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import Table from "../../../../Components/UI/Table";
import Badge from "../../../../Components/UI/Badge";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Pagination from "../../../../Components/UI/Pagination";
import { useSortableTableData } from "../../../../Hooks/useSortableTableData";

const ITEMS_PER_PAGE = 10;

const logsData = [
    {
        id: "1",
        tagId: { icon: Building2, name: "CleanFlow Solutions", sub: "LND-001" },
        assets: { name: "King Duvet Cover", sub: "LNS-BED-0041" },
        location: "Chicago, IL",
        mode: "Automatic",
        batch: "10",
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
                <div className="flex min-w-0 items-start gap-3">
                    <IconWrapper
                        icon={row.tagId.icon}
                        variant="info"
                        sizeClassName="h-9 w-9 shrink-0"
                        roundedClassName="rounded-xl"
                        iconSize={16}
                    />
                    <div className="min-w-0 leading-tight">
                        <p className="m-0 text-sm font-bold text-(--theme-text-primary)">
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
            <div className="min-w-0 leading-tight">
                <p className="m-0 text-sm font-bold text-(--theme-text-primary)">
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
            return (
                <div className="text-sm font-medium text-(--theme-text-secondary)">
                    {row.location}
                </div>
            );
        }
    },
    {
        align: "center",
        key: "mode",
        label: "MODE",
        sortable: true,
        render: (_, row) => (
            <div className="flex items-center gap-3">
                
                <Badge variant={row.mode === 'Automatic' ? 'info' : 'neutral'} size="sm">
                    {row.mode}
                </Badge>
            </div>
        ),
    },
    {
        align: "center",
        key: "batch",
        label: "BATCH",
        sortable: true,
        render: (_, row) => (
            <div className="text-sm font-bold whitespace-nowrap text-(--color-sky-blue)">
                {row.batch}
            </div>
        ),
    },
    {
        key: "itemsSent",
        align: "center",
        label: "ITEMS SENT",
        sortable: true,
        render: (_, row) => (
            <span className="text-sm font-black text-(--theme-text-primary)">{row.itemsSent}</span>
        ),
    },
    {
        key: "delayed",
        align: "center",
        label: "DELAYED",
        sortable: true,
        render: (_, row) => (
            <span className={`text-sm font-bold ${row.delayed !== "—" ? "text-(--color-overdue)" : "text-(--theme-text-muted)"}`}>
                {row.delayed}
            </span>
        ),
    },
    {
        align: "center",
        key: "lastActivity",
        label: "LAST ACTIVITY",
        sortable: true,
        render: (_, row) => (
            <span className="text-xs font-bold text-(--theme-text-muted)">{row.lastActivity}</span>
        ),
    }
];

const ScanLogsTable = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const { handleSort, sortedData, sortBy, sortDirection } = useSortableTableData(logsData);
    const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;

    const paginatedData = useMemo(() => {
        const startIndex = activePage * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [activePage, sortedData]);

    const resetCurrentPage = () => setCurrentPage(0);

    const handleTableSort = (nextSortBy, nextSortDirection) => {
        handleSort(nextSortBy, nextSortDirection);
        resetCurrentPage();
    };

    return (
        <div>
            <Table
                columns={columns}
                data={paginatedData}
                emptyText="No scan logs found"
                rowKey="id"
                onSort={handleTableSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
            />

            <Pagination
                pageCount={pageCount}
                totalItems={sortedData.length}
                itemsPerPage={ITEMS_PER_PAGE}
                forcePage={activePage}
                onPageChange={({ selected }) => setCurrentPage(selected)}
            />
        </div>
    );
};

export default ScanLogsTable;
