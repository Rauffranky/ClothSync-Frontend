import { useCallback, useState } from "react";
import Card from "../../../Components/UI/Card";
import AssetsTable from "./AssetsTable";
import AssetStats from "./stats";

const AssetIndex = () => {
    const [counts, setCounts] = useState(null);
    const handleCountsChange = useCallback((nextCounts) => setCounts(nextCounts), []);

    return (
        <div className="space-y-5">
            <AssetStats counts={counts} />
            <Card padding="0" rounded="18px">
                <AssetsTable onCountsChange={handleCountsChange} />
            </Card>
        </div>
    );
};
export default AssetIndex;
