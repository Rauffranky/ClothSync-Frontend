import { UserCheck, UserRoundX, UsersRound } from "lucide-react";
import Card from "../../../Components/UI/Card";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import IconWrapper from "../../../Components/UI/IconWrapper";

const stats = [
  { key: "totalStaff", label: "Total Staff", icon: UsersRound, variant: "info" },
  { key: "activeStaff", label: "Active Staff", icon: UserCheck, variant: "success" },
  { key: "inactiveStaff", label: "Inactive Staff", icon: UserRoundX, variant: "danger" },
];

const getDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return Number.isFinite(Number(value)) ? Number(value) : "-";
};

const StaffStats = ({ loading = false, summary = null }) => {
  if (loading) {
    return (
      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
          <CardSkeleton key={item.key} lines={2} padding="20px" rounded="12px" />
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-3 sm:grid-cols-3 ">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.key} padding="20px" rounded="12px">
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
                  {getDisplayValue(summary?.[item.key])}
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
