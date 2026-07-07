import { useMemo, useState } from "react";

const MONTH_NAME_PATTERN =
  /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i;

const getValue = (row, accessor) => {
  if (typeof accessor === "function") return accessor(row);
  if (!accessor) return undefined;

  return String(accessor)
    .split(".")
    .reduce((value, key) => value?.[key], row);
};

const getComparableValue = (row, sortBy) => {
  const value = getValue(row, sortBy);
  if (value === null || value === undefined || value === "-") return null;
  if (typeof value === "number") return value;

  const stringValue = String(value).trim();
  const normalizedDate = stringValue.replace(/\s+-\s+/, " ");
  const timestamp = Date.parse(normalizedDate);

  if (MONTH_NAME_PATTERN.test(stringValue) && !Number.isNaN(timestamp)) {
    return timestamp;
  }

  return stringValue.toLowerCase();
};

export const useSortableTableData = (data = []) => {
  const [sortBy, setSortBy] = useState();
  const [sortDirection, setSortDirection] = useState();

  const sortedData = useMemo(() => {
    if (!sortBy || !sortDirection) return data;

    return [...data].sort((left, right) => {
      const leftValue = getComparableValue(left, sortBy);
      const rightValue = getComparableValue(right, sortBy);
      const leftIsEmpty = leftValue === null || leftValue === "";
      const rightIsEmpty = rightValue === null || rightValue === "";

      if (leftIsEmpty && rightIsEmpty) return 0;
      if (leftIsEmpty) return 1;
      if (rightIsEmpty) return -1;
      if (leftValue === rightValue) return 0;

      const result = leftValue > rightValue ? 1 : -1;
      return sortDirection === "asc" ? result : -result;
    });
  }, [data, sortBy, sortDirection]);

  const handleSort = (nextSortBy, nextSortDirection) => {
    setSortBy(nextSortBy);
    setSortDirection(nextSortDirection);
  };

  return {
    handleSort,
    sortedData,
    sortBy,
    sortDirection,
  };
};
