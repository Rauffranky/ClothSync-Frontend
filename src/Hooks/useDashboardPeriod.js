import { useState, useCallback } from "react";

/**
 * Manages the dashboard time period filter state.
 * period: "today" | "this_week" | "this_month" | "custom"
 */
const useDashboardPeriod = () => {
  const [period, setPeriod] = useState("this_week");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });

  const selectPeriod = useCallback((value) => {
    setPeriod(value);
    if (value !== "custom") {
      setCustomRange({ from: "", to: "" });
    }
  }, []);

  const setCustomFrom = useCallback((from) => {
    setCustomRange((prev) => ({ ...prev, from }));
    setPeriod("custom");
  }, []);

  const setCustomTo = useCallback((to) => {
    setCustomRange((prev) => ({ ...prev, to }));
    setPeriod("custom");
  }, []);

  return { period, customRange, selectPeriod, setCustomFrom, setCustomTo };
};

export default useDashboardPeriod;
