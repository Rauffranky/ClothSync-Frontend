import { useEffect, useState } from "react";

export const DEFAULT_SEARCH_DEBOUNCE_MS = 400;
export const DEFAULT_SEARCH_MIN_LENGTH = 3;

export const getSearchQuery = (
  value,
  minLength = DEFAULT_SEARCH_MIN_LENGTH,
) => {
  const normalizedValue = String(value ?? "").trim();

  return normalizedValue.length >= minLength ? normalizedValue : "";
};

export const useDebouncedSearch = (
  value,
  {
    delay = DEFAULT_SEARCH_DEBOUNCE_MS,
    minLength = DEFAULT_SEARCH_MIN_LENGTH,
  } = {},
) => {
  const nextSearch = getSearchQuery(value, minLength);
  const [debouncedSearch, setDebouncedSearch] = useState(nextSearch);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(nextSearch),
      nextSearch ? delay : 0,
    );

    return () => window.clearTimeout(timeoutId);
  }, [delay, nextSearch]);

  return debouncedSearch;
};
