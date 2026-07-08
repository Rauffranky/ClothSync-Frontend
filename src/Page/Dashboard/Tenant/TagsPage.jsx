import { usePageMeta } from "../../../Hooks/usePageMeta";
import TagsIndex from "../../../Section/Tenant/Tags";

const TagsPage = () => {
    usePageMeta({
        title: "Tags Management - ClothSync",
        meta: [
            {
                name: "description",
                content: "View and manage tags in the ClothSync portal.",
            },
        ],
    });

    return (
        <div>
            <TagsIndex />
        </div>
    );
};

export default TagsPage;
