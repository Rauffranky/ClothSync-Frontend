import { useState } from 'react';
import ScannerStatusCard from './ScannerStatusCard';
import SummaryCards from './SummaryCards';
import Card from '../../../Components/UI/Card';
import Tabs from '../../../Components/UI/Tabs';
import Button from '../../../Components/UI/Button';
import NewUnLinkTags from './components/NewUnLinkTags';
import ExistingLinkedTags from './components/ExistingLinkedTags';
import DetachedTags from './components/DetachedTags';
import { ScanLine, Info } from 'lucide-react';

const BulkScanningIndex = () => {
    const [activeTab, setActiveTab] = useState("new");

    const tabs = [
        { label: "New Unlinked Tags", value: "new", count: 8 },
        { label: "Existing Linked Tags", value: "existing", count: 10 },
        { label: "Detached Tags", value: "detached", count: 10 },
        // { label: "Exceptions", value: "exceptions", count: 4 },
    ];

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-(--theme-text-primary)">
                        <ScanLine size={24} className="text-blue-600" />
                        <h1 className="text-2xl font-black m-0">Bulk Scan Tags</h1>
                    </div>
                    <p className="text-sm font-medium text-(--theme-text-secondary) m-0">
                        Scan RFID tags in bulk, review existing assets, and assign categories to newly detected tags.
                    </p>
                </div>
                <Button variant="primary" rightIcon={<Info size={16} />} className="px-6 py-2">
                    Clear All Entries
                </Button>
            </div>

            <ScannerStatusCard />
            <SummaryCards />

            <Card padding="0" rounded="18px" className="overflow-hidden">
                <div className="border-b border-(--theme-border) px-4 py-3 bg-(--theme-surface)">
                    <Tabs items={tabs} value={activeTab} onChange={setActiveTab} />
                </div>

                {activeTab === "new" && <NewUnLinkTags />}
                {activeTab === "existing" && <ExistingLinkedTags />}
                {activeTab === "detached" && <DetachedTags />}
                {/* {activeTab === "exceptions" && <div className="p-8 text-center text-(--theme-text-muted)">Exceptions Content</div>} */}
            </Card>
        </div>
    );
};

export default BulkScanningIndex;
