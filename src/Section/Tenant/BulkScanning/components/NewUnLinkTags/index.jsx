import { useState } from 'react';
import Table from '../../../../../Components/UI/Table';
import Alert from '../../../../../Components/UI/Alert';
import Button from '../../../../../Components/UI/Button';
import Input from '../../../../../Components/UI/Input';
import Dropdown from '../../../../../Components/UI/Dropdown';
import Modal from '../../../../../Components/UI/Modal';
import { CheckCircle2, X, Info, Shirt, Layers, Tag, MapPin } from 'lucide-react';
import SelectionCheckbox from '../SelectionCheckbox';
import useTagSelection from '../useTagSelection';

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

const categoryOptions = [
    { value: "linens", label: "Linens" },
    { value: "uniforms", label: "Uniforms" },
    { value: "towels", label: "Towels" }
];

const NewUnLinkTags = () => {
    const [showSuccessAlert, setShowSuccessAlert] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Modal Form States
    const [assetName, setAssetName] = useState("");
    const [category, setCategory] = useState("");
    const [tagWashLimit, setTagWashLimit] = useState("");
    const [categoryWashLimit, setCategoryWashLimit] = useState("");
    const [zone, setZone] = useState("");
    const [description, setDescription] = useState("");
    const { allSelected, selectedIds, someSelected, toggleAll, toggleRow } = useTagSelection(mockData);

    const columns = [
        {
            key: "checkbox",
            label: (
                <SelectionCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    label="Select all new unlinked tags"
                    onChange={toggleAll}
                />
            ),
            sortable: false,
            width: 48,
            render: (_, row) => (
                <SelectionCheckbox
                    checked={selectedIds.has(row.id)}
                    label={`Select tag ${row.epc}`}
                    onChange={(checked) => toggleRow(row.id, checked)}
                />
            )
        },
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
        <div className="px-4 pb-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-bold text-(--theme-text-secondary) flex items-center gap-2">
                    <Info size={16} className="text-(--color-aurora-teal)" />
                    New tags can be assigned to a category in bulk before creating or linking assets.
                </p>

                <div className="flex items-center gap-4">
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>Add Bulk to System</Button>
                </div>
            </div>

            {showSuccessAlert && (
                <Alert 
                    variant="success" 
                    className="mb-4"
                    leftIcon={<CheckCircle2 size={18} className="text-(--color-fresh-mint)" />}
                >
                    <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-bold text-[color-mix(in_srgb,var(--color-fresh-mint)_70%,var(--theme-text-primary))]">6 new tags saved successfully. Audit log created.</span>
                        <button onClick={() => setShowSuccessAlert(false)} className="text-(--color-fresh-mint) hover:opacity-80 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                </Alert>
            )}

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

            <Modal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Asset"
                description="Register a new linen or asset and map it to an RFID tag."
                width={650}
                footer={
                    <>
                        <Button variant="outline" className="px-6 py-2" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" className="px-6 py-2" leftIcon={<CheckCircle2 size={18} />}>Add Asset</Button>
                    </>
                }
            >
                <div className="grid grid-cols-2 gap-5 mt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-(--theme-text-primary)">Asset Name <span className="text-red-500">*</span></label>
                        <Input 
                            placeholder="e.g. King Duvet Cover" 
                            leftIcon={<Shirt size={16} className="text-(--theme-text-muted)" />} 
                            value={assetName}
                            onChange={setAssetName}
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-(--theme-text-primary)">Category <span className="text-red-500">*</span></label>
                        <Dropdown 
                            options={categoryOptions}
                            value={category}
                            onChange={setCategory}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-(--theme-text-primary)">Tag Wash Limit <span className="text-red-500">*</span></label>
                        <Input 
                            leftIcon={<Tag size={16} className="text-(--theme-text-muted)" />} 
                            value={tagWashLimit}
                            onChange={setTagWashLimit}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-(--theme-text-primary)">Category Wash Limit <span className="text-red-500">*</span></label>
                        <Input 
                            leftIcon={<Layers size={16} className="text-(--theme-text-muted)" />} 
                            value={categoryWashLimit}
                            onChange={setCategoryWashLimit}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                        <label className="text-sm font-bold text-(--theme-text-primary)">Zone <span className="text-red-500">*</span></label>
                        <Input 
                            leftIcon={<MapPin size={16} className="text-(--theme-text-muted)" />} 
                            value={zone}
                            onChange={setZone}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2">
                        <label className="text-sm font-bold text-(--theme-text-primary)">Description / Notes</label>
                        <textarea 
                            className="w-full rounded-xl border border-(--theme-border) bg-(--theme-surface) px-4 py-3 text-sm text-(--theme-text-primary) focus:border-(--color-sky-blue) focus:outline-none focus:ring-1 focus:ring-(--color-sky-blue) resize-none"
                            placeholder="Fabric type, condition, notes..."
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default NewUnLinkTags;
