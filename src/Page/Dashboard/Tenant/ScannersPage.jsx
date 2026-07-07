import { usePageMeta } from "../../../Hooks/usePageMeta";
import ScannerManagementIndex from "../../../Section/Tenant/Scanner";

const ScannersPage = () => {
    usePageMeta({
        title: "Scanner Management - ClothSync",
        meta: [
            {
                name: "description",
                content: "Manage fixed and portable RFID scanners in the ClothSync portal.",
            },
        ],
    });

    return (
        <div>
            <ScannerManagementIndex />
        </div>
    );
};

export default ScannersPage;
