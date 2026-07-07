import AssetsTable from "./AssetsTable";
import AssetStats from "./stats";

const AssetIndex = () => {
    return (
        <div className="flex flex-col gap-2">
            <AssetStats />
            <div>
                <AssetsTable />
            </div>
        </div>
    );
};
export default AssetIndex;