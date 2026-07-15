import {
  Eye,
  LockKeyhole,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserRoundX,
} from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";

const SUMMARY_STATS = [
  {
    key: "totalRoles",
    label: "Total Roles",
    icon: ShieldCheck,
    variant: "info",
  },
  {
    key: "fullAccessRoles",
    label: "Full Access Roles",
    icon: LockKeyhole,
    variant: "success",
  },
  {
    key: "viewOnlyRoles",
    label: "View Only Roles",
    icon: Eye,
    variant: "neutral",
  },
  {
    key: "limitedAccessRoles",
    label: "Limited Access Roles",
    icon: ShieldAlert,
    variant: "warning",
  },
  {
    key: "activeRoles",
    label: "Active Roles",
    icon: UserCheck,
    variant: "success",
  },
  {
    key: "inactiveRoles",
    label: "Inactive Roles",
    icon: UserRoundX,
    variant: "danger",
  },
];

const StaffRoleStats = ({ summary, loading = false }) => {
  if (loading) {
    return (
      <section className="grid gap-3  sm:grid-cols-3 xl:grid-cols-6">
        {SUMMARY_STATS.map((stat) => (
          <CardSkeleton key={stat.key} lines={2} padding="20px" rounded="14px" />
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-3  sm:grid-cols-3 xl:grid-cols-6">
      {SUMMARY_STATS.map((stat) => (
        <Card key={stat.key} padding="20px" rounded="14px">
          <div className="flex items-center gap-4">
            <IconWrapper
              icon={stat.icon}
              iconSize={20}
              roundedClassName="rounded-xl"
              sizeClassName="h-12 w-12"
              variant={stat.variant}
            />
            <div>
              <p className="m-0 text-3xl font-black leading-none text-(--theme-text-primary)">
                {summary?.[stat.key] ?? "-"}
              </p>
              <p className="m-0 mt-1 text-sm font-semibold text-(--theme-text-muted)">
                {stat.label}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
};

export default StaffRoleStats;
