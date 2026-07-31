import { useState } from 'react';
import Table from '../../../../../Components/UI/Table';
import Alert from '../../../../../Components/UI/Alert';
import Button from '../../../../../Components/UI/Button';
import Input from '../../../../../Components/UI/Input';
import Dropdown from '../../../../../Components/UI/Dropdown';
import Badge from '../../../../../Components/UI/Badge';
import ActionDropdown from '../../../../../Components/UI/ActionDropdown';
import { CheckCircle2, X, Search } from 'lucide-react';

const mockData = [
    { id: 1, epc: "000209A3F1B010..", name: "Table Cloth 60x90", assetId: "AST-9901", category: "Linens", status: "In Business", location: "North Branch", time: "10:42:28 AM" },
    { id: 2, epc: "000209A3F1B009..", name: "Bath Robe White", assetId: "AST-2218", category: "Robes", status: "In Business", location: "Downtown Hub", time: "10:42:25 AM" },
    { id: 3, epc: "000209A3F1B008..", name: "Waiter Apron Black", assetId: "AST-4490", category: "Uniforms", status: "In Business", location: "West Side Depot", time: "10:42:23 AM" },
    { id: 4, epc: "000209A3F1BDUP..", name: "Bath Towel Large", assetId: "AST-4821", category: "Towels", status: "In Business", location: "Downtown Hub", time: "10:42:20 AM" },
    { id: 5, epc: "000209A3F1B006..", name: "Pillow Case Standard", assetId: "AST-6634", category: "Bedding", status: "In Business", location: "Downtown Hub", time: "10:42:18 AM" },
    { id: 6, epc: "000209A3F1B005..", name: "Floor Mat Anti-Slip", assetId: "AST-8832", category: "Mats", status: "In Business", location: "North Branch", time: "10:42:15 AM" },
    { id: 7, epc: "000209A3F1B004..", name: "Hand Towel Medium", assetId: "AST-5512", category: "Towels", status: "At Laundry", location: "Downtown Hub", time: "10:42:11 AM" },
    { id: 8, epc: "000209A3F1B003..", name: "White Duvet Cover", assetId: "AST-7741", category: "Bedding", status: "In Business", location: "West Side Depot", time: "10:42:08 AM" },
];

const categoryOptions = [
    { label: "All Categories", value: "all" },
    { label: "Linens", value: "linens" },
    { label: "Robes", value: "robes" },
    { label: "Uniforms", value: "uniforms" },
    { label: "Towels", value: "towels" },
    { label: "Bedding", value: "bedding" },
    { label: "Mats", value: "mats" },
];

const ExistingLinkedTags = () => {
    // States for alerts and UI conditions
    const [undoState, setUndoState] = useState("timer"); // "timer" | "undone"
    const [showActionAlert, setShowActionAlert] = useState(true);
    const [currentAction, setCurrentAction] = useState("check-in"); // "check-in" | "check-out"
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const handleUndo = () => {
        setUndoState("undone");
    };

    const handleActionSelect = (action) => {
        setCurrentAction(action);
        setUndoState("timer");
        setShowActionAlert(true);
    };

    const columns = [
        {
            key: "checkbox",
            label: <input type="checkbox" className="rounded border-gray-300" />,
            sortable: false,
            width: 48,
            render: () => <input type="checkbox" className="rounded border-gray-300" />
        },
        {
            key: "epc",
            label: "TAG EPC",
            sortable: false,
            render: (_, row) => <span className="font-mono text-sm font-bold text-(--theme-text-primary)">{row.epc}</span>
        },
        {
            key: "name",
            label: "ASSET NAME",
            sortable: false,
            render: (_, row) => <span className="text-sm font-bold text-(--theme-text-primary)">{row.name}</span>
        },
        {
            key: "assetId",
            label: "ASSET ID",
            sortable: false,
            render: (_, row) => <span className="text-sm font-medium text-(--theme-text-secondary)">{row.assetId}</span>
        },
        {
            key: "category",
            label: "CATEGORY",
            sortable: false,
            render: (_, row) => (
                <Badge size="sm" variant="neutral" className="bg-(--theme-surface-hover) border-none text-(--theme-text-secondary)">
                    📁 {row.category}
                </Badge>
            )
        },
        {
            key: "status",
            label: "STATUS",
            sortable: false,
            render: (_, row) => (
                <Badge size="sm" variant="info" className="bg-opacity-10">
                    {row.status}
                </Badge>
            )
        },
        {
            key: "location",
            label: "LOCATION",
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-1.5 text-(--theme-text-secondary) font-medium text-sm">
                    <span className="text-(--theme-text-muted)">📍</span> {row.location}
                </div>
            )
        },
        {
            key: "time",
            label: "LAST SCAN",
            sortable: false,
            render: (_, row) => <span className="text-(--theme-text-secondary) font-mono text-sm font-medium">{row.time}</span>
        }
    ];

    const actionItems = [
        { label: "Check In", onClick: () => handleActionSelect("check-in") },
        { label: "Check Out", onClick: () => handleActionSelect("check-out") },
        { label: "Re-Tag", onClick: () => {} },
        { label: "Retire", onClick: () => {} },
    ];

    const isCheckIn = currentAction === "check-in";

    return (
        <div className="px-4 pb-4 mt-4">
            
            {/* Top Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 w-full max-w-lg">
                    <Input 
                        placeholder="Search EPC or asset name..." 
                        value={searchQuery}
                        onChange={setSearchQuery}
                        leftIcon={<Search size={16} className="text-(--theme-text-muted)" />}
                    />
                    <div className="w-48 shrink-0">
                        <Dropdown 
                            options={categoryOptions}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {undoState === "timer" && (
                        <>
                            <span className="text-sm font-bold text-(--theme-text-secondary)">
                                Auto {isCheckIn ? "Check-In" : "Check Out"} In <span className="text-[var(--color-fresh-mint)]">02:00</span>
                            </span>
                            <Button variant="primary" onClick={handleUndo}>Undo</Button>
                        </>
                    )}
                    {undoState === "undone" && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-(--theme-text-secondary)">Actions:</span>
                            <ActionDropdown items={actionItems} />
                        </div>
                    )}
                </div>
            </div>

            {/* Alerts */}
            {undoState === "undone" && (
                <Alert 
                    variant="warning" 
                    className="mb-4"
                >
                    <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-bold text-[color-mix(in_srgb,var(--color-sunlit-gold)_70%,var(--theme-text-primary))]">
                            You Undo the Auto {isCheckIn ? "Check in" : "Check out"} , please do action after selecting items
                        </span>
                        <button onClick={() => setUndoState("timer")} className="text-[var(--color-sunlit-gold)] hover:opacity-80 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                </Alert>
            )}

            {showActionAlert && undoState === "timer" && (
                <Alert 
                    variant={isCheckIn ? "success" : "info"} 
                    className="mb-4"
                    leftIcon={<CheckCircle2 size={18} className={isCheckIn ? "text-(--color-fresh-mint)" : "text-(--color-sky-blue)"} />}
                >
                    <div className="flex justify-between items-center w-full">
                        <span className={`text-sm font-bold ${isCheckIn ? 'text-[var(--color-fresh-mint)]' : 'text-[var(--color-sky-blue)]'}`}>
                            10 tags auto {isCheckIn ? "Check in" : "Check Out"}
                        </span>
                        <button onClick={() => setShowActionAlert(false)} className={`${isCheckIn ? 'text-(--color-fresh-mint)' : 'text-(--color-sky-blue)'} hover:opacity-80 transition-opacity`}>
                            <X size={16} />
                        </button>
                    </div>
                </Alert>
            )}

            <Table 
                columns={columns} 
                data={mockData}
                rowKey="id"
            />
        </div>
    );
};

export default ExistingLinkedTags;
