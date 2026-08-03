import { useEffect, useRef } from 'react';

const SelectionCheckbox = ({ checked, indeterminate = false, label, onChange }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <input
            aria-label={label}
            checked={checked}
            className="h-4 w-4 cursor-pointer rounded border-gray-300"
            onChange={(event) => onChange(event.target.checked)}
            ref={inputRef}
            type="checkbox"
        />
    );
};

export default SelectionCheckbox;
