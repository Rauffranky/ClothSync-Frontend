import { useState } from 'react';
import Table from '../../../Components/UI/Table';
import Card from '../../../Components/UI/Card';
import Alert from '../../../Components/UI/Alert';
import Button from '../../../Components/UI/Button';
import Tabs from '../../../Components/UI/Tabs';
import { CheckCircle2, X, Info } from 'lucide-react';

const mockData = [
    { id: 1, epc: "111310B4G2C008...", time: "10:42:22 AM", location: "West Side Depot" },
    { id: 2, epc: "VALIDFORMAT007...", time: "10:42:19 AM", location: "Downtown Hub" },
    { id: 3, epc: "111310B4G2C006...", time: "10:42:17 AM", location: "North Branch" },
    { id: 4, epc: "111310BDUP0005...", time: "10:42:14 AM", location: "Downtown Hub" },
    { id: 5, epc: "111310B4G2C004...", time: "10:42:12 AM", location: "Downtown Hub" },
    { id: 6, epc: "111310B4G2C003...", time: "10:42:09 AM", location: "West Side Depot" },
    { id: 7, epc: "111310B4G2C002...", time: "10:42:06 AM", location: "Downtown Hub" },
    { id: 8, epc: "111310B4G2C001...", time: "10:42:03 AM", location: "Downtown Hub" },
];

const ScanningTable = () => {
    const [activeTab, setActiveTab] = useState("new");
    const [showAlert, setShowAlert] = useState(true);

    const tabs = [
        { label: "New Unlinked Tags", value: "new", count: 8 },
        { label: "Existing Linked Tags", value: "existing", count: 10 },
        { label: "Detached Tags", value: "detached", count: 10 },
    ];

    const columns = [
        {
            key: "epc",
            label: "TAG EPC",
            sortable: false,
            render: (_, row) => <span className="font-mono text-sm font-bold text-(--theme-text-primary)">{row.epc}</span>
        },
        {
            key: "time",
            label: "SCAN TIME",
            sortable: false,
            render: (_, row) => <span className="text-(--theme-text-secondary) font-mono text-sm font-medium">{row.time}</span>
        },
        {
            key: "location",
            label: "SCANNER LOCATION",
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-1.5 text-(--theme-text-secondary) font-medium">
                    <span className="text-(--theme-text-muted)">📍</span> {row.location}
                </div>
            )
        }
    ];

    return (
        <Card padding="0" rounded="18px" className="overflow-hidden">
            <div className="border-b border-(--theme-border) px-4 pt-3 bg-(--theme-surface)">
                <Tabs items={tabs} value={activeTab} onChange={setActiveTab} />
            </div>

            <div className="px-4 pb-4 mt-4">
                {showAlert && (
                    <Alert
                        variant="success"
                        className="mb-4"
                        leftIcon={<CheckCircle2 size={18} className="text-(--color-fresh-mint)" />}
                    >
                        <div className="flex justify-between items-center w-full">
                            <span className="text-sm font-bold text-[color-mix(in_srgb,var(--color-fresh-mint)_70%,var(--theme-text-primary))]">6 new tags saved successfully. Audit log created.</span>
                            <button onClick={() => setShowAlert(false)} className="text-(--color-fresh-mint) hover:opacity-80 transition-opacity">
                                <X size={16} />
                            </button>
                        </div>
                    </Alert>
                )}

                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-bold text-(--theme-text-secondary) flex items-center gap-2">
                        <Info size={16} className="text-(--color-aurora-teal)" />
                        New tags can be assigned to a category in bulk before creating or linking assets.
                    </p>
                    <Button variant="primary">Add Bulk to System</Button>
                </div>

                <Table
                    columns={columns}
                    data={mockData}
                />

                <div className="mt-4 flex justify-between items-center px-1">
                    <span className="text-sm font-medium text-(--theme-text-muted)">8 new tags</span>
                    <span className="text-sm font-medium text-(--theme-text-muted) flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-sunlit-gold)]"></span> Scan paused
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default ScanningTable;
