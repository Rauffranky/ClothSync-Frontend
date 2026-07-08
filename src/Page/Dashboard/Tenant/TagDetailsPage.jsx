import { usePageMeta } from "../../../Hooks/usePageMeta";
import TagDetailIndex from "../../../Section/Tenant/Tags/TagsDetail";

const TagDetailsPage = () => {
    usePageMeta({
        title: "Tag Details - ClothSync",
        meta: [
            {
                name: "description",
                content: "View details of a specific tag.",
            },
        ],
    });

    return (
        <div>
            <TagDetailIndex />
        </div>
    );
};

export default TagDetailsPage;
