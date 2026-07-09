import { LockKeyhole, UserCheck, UserRoundX, UsersRound } from "lucide-react";
import Card from "../../../Components/UI/Card";
import IconWrapper from "../../../Components/UI/IconWrapper";

const StaffStats = ({ data = [] }) => {
  const activeCount = data.filter((item) => item.status === "Active").length;
  const inactiveCount = data.filter((item) => item.status === "Inactive").length;
  const limitedCount = data.filter(
    (item) => item.permission === "Limited Access",
  ).length;

  const stats = [
    {
      value: data.length,
      label: "Total Staff",
      icon: UsersRound,
      variant: "info",
    },
    {
      value: activeCount,
      label: "Active Staff",
      icon: UserCheck,
      variant: "success",
    },
    {
      value: inactiveCount,
      label: "Inactive Staff",
      icon: UserRoundX,
      variant: "neutral",
    },
    {
      value: limitedCount,
      label: "Limited Access",
      icon: LockKeyhole,
      variant: "warning",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} padding="20px" rounded="12px">
            <div className="flex items-center gap-4">
              <IconWrapper
                icon={Icon}
                iconSize={20}
                roundedClassName="rounded-xl"
                sizeClassName="h-12 w-12"
                variant={item.variant}
              />
              <div>
                <p className="m-0 text-3xl font-black leading-none text-(--theme-text-primary)">
                  {item.value}
                </p>
                <p className="m-0 mt-1 text-sm font-semibold text-(--theme-text-muted)">
                  {item.label}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
};

export default StaffStats;
