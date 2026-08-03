import { useMemo, useState } from 'react';

const useTagSelection = (rows) => {
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const rowIds = useMemo(() => new Set(rows.map((row) => row.id)), [rows]);
    const selectedRowCount = [...selectedIds].filter((id) => rowIds.has(id)).length;
    const allSelected = rows.length > 0 && selectedRowCount === rows.length;
    const someSelected = selectedRowCount > 0 && !allSelected;

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
