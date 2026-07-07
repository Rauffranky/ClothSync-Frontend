import { usePageMeta } from "../../../Hooks/usePageMeta";
import AssetDetailsIndex from "../../../Section/Tenant/assets/AssetDetails";

const AssetDetailsPage = () => {
    usePageMeta({
        title: "Asset Detail - ClothSync",
        meta: [
            {
                name: "description",
                content: "View detailed information about a specific asset.",
            },
        ],
    });

    return (
        <div>
            <AssetDetailsIndex />
        </div>
    );
};

export default AssetDetailsPage;
