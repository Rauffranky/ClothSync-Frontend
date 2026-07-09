import { Building2, Users } from "lucide-react";

export const portalTabs = [
  {
    label: "Business",
    value: "business",
    icon: <Building2 size={16} />,
    title: "Business / Tenant",
    dashboardPath: "/business/dashboard",
  },
  {
    label: "Laundry",
    value: "laundry",
    icon: <Users size={16} />,
    title: "Laundry Staff",
    dashboardPath: "/laundry/dashboard",
  },
];

export const getPortal = (role) =>
  portalTabs.find((item) => item.value === role) || portalTabs[0];
