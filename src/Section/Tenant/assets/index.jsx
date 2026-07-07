import Card from "../../../Components/UI/Card";
import AssetsTable from "./AssetsTable";
import AssetStats from "./stats";

const AssetIndex = () => {
    return (
        <div className="space-y-5">
            <AssetStats />
            <Card padding="0" rounded="18px">
                <AssetsTable />
            </Card>
        </div>
    );
};
export default AssetIndex;