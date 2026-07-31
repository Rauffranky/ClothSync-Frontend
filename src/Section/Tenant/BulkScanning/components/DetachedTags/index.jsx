import { useState } from 'react';
import Table from '../../../../../Components/UI/Table';
import Alert from '../../../../../Components/UI/Alert';
import Button from '../../../../../Components/UI/Button';
import Input from '../../../../../Components/UI/Input';
import Dropdown from '../../../../../Components/UI/Dropdown';
import Modal from '../../../../../Components/UI/Modal';
import Badge from '../../../../../Components/UI/Badge';
import { CheckCircle2, X, RotateCcw, AlertTriangle, Tag, Shirt, Layers } from 'lucide-react';

const mockData = [
    { id: 1, epc: "000209A3F1B010..", previousAsset: "Table Cloth 60x90", previousCategory: "Linens", location: "North Branch", time: "10:42:28 AM" },
    { id: 2, epc: "000209A3F1B009..", previousAsset: "Bath Robe White", previousCategory: "Robes", location: "Downtown Hub", time: "10:42:25 AM" },
    { id: 3, epc: "000209A3F1B008..", previousAsset: "Waiter Apron Black", previousCategory: "Uniforms", location: "West Side Depot", time: "10:42:23 AM" },
    { id: 4, epc: "000209A3F1BDUP..", previousAsset: "Bath Towel Large", previousCategory: "Towels", location: "Downtown Hub", time: "10:42:20 AM" },
    { id: 5, epc: "000209A3F1B006..", previousAsset: "Pillow Case Standard", previousCategory: "Bedding", location: "Downtown Hub", time: "10:42:18 AM" },
    { id: 6, epc: "000209A3F1B005..", previousAsset: "Floor Mat Anti-Slip", previousCategory: "Mats", location: "North Branch", time: "10:42:15 AM" },
    { id: 7, epc: "000209A3F1B004..", previousAsset: "Hand Towel Medium", previousCategory: "Towels", location: "Downtown Hub", time: "10:42:11 AM" },
];

const DetachedTags = () => {
    const [isRetagModalOpen, setIsRetagModalOpen] = useState(false);
    const [retagType, setRetagType] = useState("tag"); // "category" | "tag"
    const [tagWashLimit, setTagWashLimit] = useState("");
    const [reason, setReason] = useState("");

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
            key: "previousAsset",
            label: "PREVIOUS ASSET",
            sortable: false,
            render: (_, row) => <span className="text-sm font-bold text-(--theme-text-primary)">{row.previousAsset}</span>
        },
        {
            key: "previousCategory",
            label: "PREVIOUS CATEGORY",
            sortable: false,
            render: (_, row) => (
                <Badge size="sm" variant="neutral" className="bg-(--theme-surface-hover) border-none text-(--theme-text-secondary)">
                    📁 {row.previousCategory}
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

    return (
        <div className="px-4 pb-4 mt-4">
            
            <div className="flex gap-4 items-start mb-4">
                <Alert 
                    variant="warning" 
                    className="flex-1"
                >
                    <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-bold text-[color-mix(in_srgb,var(--color-sunlit-gold)_70%,var(--theme-text-primary))]">
                            please do action after selecting items
                        </span>
                        <button className="text-[var(--color-sunlit-gold)] hover:opacity-80 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                </Alert>
                <Button 
                    className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white font-bold h-[42px] px-6 border-none rounded-xl"
                    onClick={() => setIsRetagModalOpen(true)}
                    leftIcon={<RotateCcw size={16} />}
                >
                    Re-Tag
                </Button>
            </div>

            <Table 
                columns={columns} 
                data={mockData}
                rowKey="id"
            />

            <Modal
                open={isRetagModalOpen}
                onClose={() => setIsRetagModalOpen(false)}
                title="Retag"
                description="Register a new linen or asset and map it to an RFID tag."
                width={550}
                footer={
                    <>
                        <Button variant="outline" className="px-6 py-2" onClick={() => setIsRetagModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" className="px-6 py-2" leftIcon={<CheckCircle2 size={18} />}>
                            {retagType === "category" ? "Change Category" : "Change Tag"}
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-5 mt-2">
                    {/* Radio Options */}
                    <div className="flex gap-6 items-center">
                        <label className="flex items-center gap-2 text-sm font-bold text-(--theme-text-primary) cursor-pointer">
                            <input 
                                type="radio" 
                                name="retagType" 
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                checked={retagType === "category"}
                                onChange={() => setRetagType("category")}
                            />
                            Category Change
                        </label>
                        <label className="flex items-center gap-2 text-sm font-bold text-(--theme-text-primary) cursor-pointer">
                            <input 
                                type="radio" 
                                name="retagType" 
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                checked={retagType === "tag"}
                                onChange={() => setRetagType("tag")}
                            />
                            Tag Change
                        </label>
                    </div>

                    {retagType === "category" ? (
                        <>
                            <div className="grid grid-cols-2 gap-5 mt-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-(--theme-text-primary)">Asset Name <span className="text-red-500">*</span></label>
                                    <Input 
                                        placeholder="e.g. King Duvet Cover" 
                                        leftIcon={<Shirt size={16} className="text-(--theme-text-muted)" />} 
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-(--theme-text-primary)">Category <span className="text-red-500">*</span></label>
                                    <Dropdown 
                                        options={[
                                            { value: "linens", label: "Linens" },
                                            { value: "uniforms", label: "Uniforms" }
                                        ]}
                                        value=""
                                        onChange={() => {}}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-(--theme-text-primary)">Category Wash Limit <span className="text-red-500">*</span></label>
                                <Input 
                                    leftIcon={<Layers size={16} className="text-(--theme-text-muted)" />} 
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-(--theme-text-primary)">Description / Notes</label>
                                <textarea 
                                    className="w-full rounded-xl border border-(--theme-border) bg-(--theme-surface) px-4 py-3 text-sm text-(--theme-text-primary) focus:border-(--color-sky-blue) focus:outline-none focus:ring-1 focus:ring-(--color-sky-blue) resize-none"
                                    placeholder="Fabric type, condition, notes..."
                                    rows={3}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <Alert variant="orange" leftIcon={<AlertTriangle size={18} className="text-[#A16207]" />}>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-[#A16207]">Scan New Tag</span>
                                    <span className="text-sm text-[#A16207]/80">Please scan new tag to attach it with Category</span>
                                </div>
                            </Alert>

                            <div className="flex flex-col gap-1.5 mt-2">
                                <label className="text-sm font-bold text-(--theme-text-primary)">Tag Wash Limit <span className="text-red-500">*</span></label>
                                <Input 
                                    leftIcon={<Tag size={16} className="text-(--theme-text-muted)" />} 
                                    value={tagWashLimit}
                                    onChange={setTagWashLimit}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-(--theme-text-primary)">Reason of Retagging</label>
                        <textarea 
                            className="w-full rounded-xl border border-(--theme-border) bg-(--theme-surface) px-4 py-3 text-sm text-(--theme-text-primary) focus:border-(--color-sky-blue) focus:outline-none focus:ring-1 focus:ring-(--color-sky-blue) resize-none"
                            placeholder="Fabric type, condition, notes..."
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DetachedTags;
