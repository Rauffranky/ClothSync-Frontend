import { usePageMeta } from "../../../Hooks/usePageMeta";
import AssetIndex from "../../../Section/Tenant/assets";

const AssetsPage = () => {
    usePageMeta({
        title: "Asset Management - ClothSync",
        meta: [
            {
                name: "description",
                content: "View and manage business categories in the ClothSync portal.",
            },
        ],
    });

    return (
        <div>
            <AssetIndex />
        </div>
    );
};

export default AssetsPage;
