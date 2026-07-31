import { usePageMeta } from "../../../Hooks/usePageMeta";
import BulkScanningIndex from "../../../Section/Tenant/BulkScanning";

const BulkScanningPage = () => {
    usePageMeta({
        title: "Bulk Scanning - ClothSync",
        meta: [
            {
                name: "description",
                content: "Manage bulk scanning operations in the ClothSync portal.",
            },
        ],
    });

    return (
        <div>
            <BulkScanningIndex />
        </div>
    );
};

export default BulkScanningPage;
