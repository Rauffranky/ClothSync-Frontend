import { useState } from 'react';

const useTagSelection = (rows) => {
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const allSelected = rows.length > 0 && selectedIds.size === rows.length;
    const someSelected = selectedIds.size > 0 && !allSelected;

    const toggleAll = (checked) => {
        setSelectedIds(checked ? new Set(rows.map((row) => row.id)) : new Set());
    };

    const toggleRow = (id, checked) => {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    return { allSelected, selectedIds, someSelected, toggleAll, toggleRow };
};

export default useTagSelection;
