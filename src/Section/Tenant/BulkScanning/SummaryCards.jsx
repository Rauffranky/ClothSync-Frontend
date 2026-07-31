import Card from '../../../Components/UI/Card';
import IconWrapper from '../../../Components/UI/IconWrapper';
import { Scan, Link2, Plus, AlertCircle } from 'lucide-react';

const SummaryCards = () => {
    return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-6">
            <Card bodyClassName="flex items-center gap-4 py-4 px-5 h-full">
                <IconWrapper icon={Scan} variant="primary" sizeClassName="w-12 h-12 shrink-0" roundedClassName="rounded-[12px]" iconSize={24} />
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-(--theme-text-primary) leading-none">18</h3>
                    <p className="text-sm font-bold text-(--theme-text-secondary) leading-tight mt-1">Total Tags<br/>Scanned</p>
                </div>
            </Card>

            <Card bodyClassName="flex items-center gap-4 py-4 px-5 h-full">
                <IconWrapper icon={Link2} variant="laundry" sizeClassName="w-12 h-12 shrink-0" roundedClassName="rounded-[12px]" iconSize={24} />
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-(--color-laundry) leading-none">8</h3>
                    <p className="text-sm font-bold text-(--theme-text-secondary) leading-tight mt-1">Existing Linked<br/>Tags</p>
                </div>
            </Card>

            <Card bodyClassName="flex items-center gap-4 py-4 px-5 h-full">
                <IconWrapper icon={Plus} variant="laundry" sizeClassName="w-12 h-12 shrink-0" roundedClassName="rounded-[12px]" iconSize={24} />
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-(--color-laundry) leading-none">6</h3>
                    <p className="text-sm font-bold text-(--theme-text-secondary) leading-tight mt-1">New Unlinked<br/>Tags</p>
                </div>
            </Card>

            <Card className="border-[color-mix(in_srgb,var(--color-overdue)_30%,transparent)]" bodyClassName="flex items-center gap-4 py-4 px-5 h-full">
                <IconWrapper icon={AlertCircle} variant="danger" sizeClassName="w-12 h-12 shrink-0" roundedClassName="rounded-[12px]" iconSize={24} />
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-(--color-overdue) leading-none">4</h3>
                    <p className="text-sm font-bold text-(--theme-text-secondary) leading-tight mt-1">Scan<br/>Exceptions</p>
                </div>
            </Card>
        </div>
    );
};

export default SummaryCards;
