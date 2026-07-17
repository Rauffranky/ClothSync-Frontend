import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantStaffDetails } from "../../../axios/staff/tenantStaff";
import { formatDateTime } from "../../../Utils/date";
import {
  normalizeStaffDetails,
  staffPermissionActions,
} from "./data";

const StaffDetailModal = ({
  getStaffDetails = getTenantStaffDetails,
  onClose,
  staff,
}) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getStaffDetails(staff?.apiId || staff?.id)
      .then((response) => {
        if (!isActive) return;
        setDetails(normalizeStaffDetails(response));
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setDetails(null);
        setLoadError(
          getApiErrorMessage(error, "Unable to load staff member details"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [getStaffDetails, refreshKey, staff?.apiId, staff?.id]);

  const displayedStaff = details || staff;
  const detailItems = displayedStaff
    ? [
        { label: "Full Name", value: displayedStaff.name, icon: UserRound },
        { label: "Email", value: displayedStaff.email, icon: Mail },
        { label: "Phone", value: displayedStaff.phone, icon: Phone },
        { label: "Staff Role", value: displayedStaff.role, icon: BriefcaseBusiness },
        { label: "Location", value: displayedStaff.location, icon: MapPin },
        { label: "Access Level", value: displayedStaff.permission, icon: ShieldCheck },
        {
          label: "Email Verified",
          value: displayedStaff.emailVerified ? "Yes" : "No",
          icon: Mail,
        },
        {
          label: "Created",
          value: formatDateTime(displayedStaff.createdAt, true),
          icon: CalendarDays,
        },
      ]
    : [];

  return (
    <Modal
      description="View staff identity, assignment, access, and verification details."
      onClose={onClose}
      open
      title="Staff Profile"
      width={760}
    >
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
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

      {!isLoading && !loadError && displayedStaff && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="md" variant={displayedStaff.permissionVariant}>
              {displayedStaff.permission}
            </Badge>
            <Badge dot size="md" variant={displayedStaff.statusVariant}>
              {displayedStaff.status}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {detailItems.map(({ icon: Icon, label, value }) => (
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
                  {value || "-"}
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

            {displayedStaff.permissions?.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-(--theme-border)">
                {displayedStaff.permissions.map((permission) => {
                  const enabledActions = staffPermissionActions.filter(
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
              <Alert variant="neutral">
                No module permissions assigned to this staff member.
              </Alert>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
};

export default StaffDetailModal;
