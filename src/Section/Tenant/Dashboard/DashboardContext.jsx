import { createContext, useContext } from "react";

export const DashboardContext = createContext(null);
export const useDashboardData = () => useContext(DashboardContext);
