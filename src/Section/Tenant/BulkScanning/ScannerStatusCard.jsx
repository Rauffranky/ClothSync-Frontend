import Card from '../../../Components/UI/Card';
import Badge from '../../../Components/UI/Badge';

const ScannerStatusCard = () => {
    return (
        <Card className="mb-6" padding="24px">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-(--theme-text-primary)"></div>
                    <h2 className="text-lg font-black text-(--theme-text-primary)">Scanner Status</h2>
                </div>
                <Badge variant="success" dot={true}>Connected</Badge>
            </div>

            <div className="flex flex-wrap xl:flex-nowrap justify-between items-center gap-4">
                <div>
                    <p className="text-sm font-bold text-(--theme-text-secondary) mb-1.5 flex items-center gap-1.5">
                        <span className="text-(--theme-text-muted)">#</span> Scanner ID
                    </p>
                    <p className="font-black text-(--theme-text-primary)">SC-001</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-(--theme-text-secondary) mb-1.5 flex items-center gap-1.5">
                        <span className="text-(--theme-text-muted)">((·))</span> Scanner Name
                    </p>
                    <p className="font-black text-(--theme-text-primary)">Gate Scanner A1</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-(--theme-text-secondary) mb-1.5 flex items-center gap-1.5">
                        <span className="text-(--theme-text-muted)">📍</span> Location
                    </p>
                    <p className="font-black text-(--theme-text-primary)">Downtown Hub</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-(--theme-text-secondary) mb-1.5 flex items-center gap-1.5">
                        <span className="text-(--theme-text-muted)">⚡</span> Status
                    </p>
                    <p className="font-black text-(--theme-text-primary)">Finished</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-(--theme-text-secondary) mb-1.5 flex items-center gap-1.5">
                        <span className="text-(--theme-text-muted)">⚙️</span> Mode
                    </p>
                    <p className="font-black text-(--theme-text-primary)">Automatic</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-(--theme-text-secondary) mb-1.5 flex items-center gap-1.5">
                        <span className="text-(--theme-text-muted)">⏱️</span> Scan Start
                    </p>
                    <p className="font-black text-(--theme-text-primary)">06:35:43 PM</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-(--theme-text-secondary) mb-1.5 flex items-center gap-1.5">
                        <span className="text-(--theme-text-muted)">🏷️</span> Last EPC
                    </p>
                    <Badge variant="primary" size="md" className="font-mono text-sm border-none bg-[color-mix(in_srgb,var(--color-aurora-teal)_15%,var(--theme-surface))]">
                        E280116060000209A
                    </Badge>
                </div>
            </div>
        </Card>
    );
};

export default ScannerStatusCard;
