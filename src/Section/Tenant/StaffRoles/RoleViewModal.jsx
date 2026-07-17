import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantStaffRoleDetails } from "../../../axios/staffRoles/tenantStaffRoles";
import { formatDateWithUserPreferences } from "../../../Utils/date";
import { normalizeStaffRoleDetails, permissionActions } from "./data";

const RoleViewModal = ({ role, onClose }) => {
  const [roleDetails, setRoleDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getTenantStaffRoleDetails(role?.apiId || role?.id)
      .then((response) => {
        if (!isActive) return;
        setRoleDetails(normalizeStaffRoleDetails(response));
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setRoleDetails(null);
        setLoadError(
          getApiErrorMessage(error, "Unable to load staff role details"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [refreshKey, role?.apiId, role?.id]);

  const displayedRole = roleDetails || role;
  const details = displayedRole
    ? [
        { label: "Role Name", value: displayedRole.name, icon: Building2 },
        {
          label: "Assigned Staff",
          value: displayedRole.staffCount,
          icon: UsersRound,
        },
        {
          label: "Access Level",
          value: displayedRole.accessLevel,
          icon: LockKeyhole,
        },
        {
          label: "Last Updated",
          value: displayedRole.lastUpdated
            ? formatDateWithUserPreferences(displayedRole.lastUpdated)
            : "-",
          icon: CalendarDays,
        },
      ]
    : [];

  return (
    <Modal
      description={
        displayedRole?.description || "View role access and assignment details."
      }
      onClose={onClose}
      open
      title="Role Details"
      width={760}
    >
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <CardSkeleton key={index} lines={2} padding="16px" rounded="12px" />
          ))}
        </div>
      )}

      {!isLoading && loadError && (
        <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button
              leftIcon={<RefreshCw size={15} />}
              onClick={() => {
                setIsLoading(true);
                setLoadError("");
                setRefreshKey((current) => current + 1);
              }}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      {!isLoading && !loadError && displayedRole && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="md" variant={displayedRole.accessVariant}>
              {displayedRole.accessLevel}
            </Badge>
            <Badge dot size="md" variant={displayedRole.statusVariant}>
              {displayedRole.status}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {details.map(({ icon: Icon, label, value }) => (
              <div
                className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-4"
                key={label}
              >
                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                  <Icon size={14} />
                  <span className="text-xs font-black uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                <p className="m-0 mt-2 wrap-break-word text-sm font-bold text-(--theme-text-primary)">
                  {value ?? "-"}
                </p>
              </div>
            ))}
          </div>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={17} className="text-(--color-aurora-teal)" />
              <h3 className="m-0 text-base font-bold text-(--theme-text-primary)">
                Module Permissions
              </h3>
            </div>

            {displayedRole.permissions?.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-(--theme-border)">
                {displayedRole.permissions.map((permission) => {
                  const enabledActions = permissionActions.filter(
                    (action) => permission[action.key],
                  );

                  return (
                    <div
                      className="flex flex-col gap-3 border-b border-(--theme-border) p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                      key={permission.id}
                    >
                      <p className="m-0 font-bold text-(--theme-text-primary)">
                        {permission.sectionName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {enabledActions.length > 0 ? (
                          enabledActions.map((action) => (
                            <Badge key={action.key} size="sm" variant="info">
                              {action.label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm font-medium text-(--theme-text-muted)">
                            No access
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Alert variant="neutral">No permissions assigned to this role.</Alert>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
};

export default RoleViewModal;
