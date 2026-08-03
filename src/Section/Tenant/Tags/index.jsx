import { useCallback, useState } from "react";
import Card from "../../../Components/UI/Card";
import StatsCards from "./StatsCards";
import TagsTable from "./TagsTable";

const TagsIndex = () => {
    const [counts, setCounts] = useState(null);
    const handleCountsChange = useCallback((nextCounts) => setCounts(nextCounts), []);

    return (
        <div className="space-y-5">
            <StatsCards counts={counts} />
            <Card padding="0" rounded="18px">
                <TagsTable onCountsChange={handleCountsChange} />
            </Card>
        </div>
    );
};
export default TagsIndex;
