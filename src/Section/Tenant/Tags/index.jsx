import Card from "../../../Components/UI/Card";
import StatsCards from "./StatsCards";
import TagsTable from "./TagsTable";

const TagsIndex = () => {
    return (
        <div className="space-y-5">
            <StatsCards />
            <Card padding="0" rounded="18px">
                <TagsTable />
            </Card>
        </div>
    );
};
export default TagsIndex;
