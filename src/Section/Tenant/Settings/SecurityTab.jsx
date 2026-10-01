import { useEffect, useState } from "react";
import {
  Clock,
  KeyRound,
  LoaderCircle,
  LogOut,
  MapPin,
  Monitor,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import GlobalTooltip from "../../../Components/UI/Tooltip";
import { getApiErrorMessage } from "../../../axios/api";
import {
  changeTenantPassword,
  getTenantSessions,
  revokeTenantSession,
  deleteTenantSession,
  revokeAllTenantSessions,
} from "../../../axios/auth/tenantAuth";
import { toast } from "../../../Utils/toast";
import { formatDateTime } from "../../../Utils/date";
import { getCurrentDeviceName } from "./data";
import { SettingsPanel } from "./SettingsComponents";

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

const SecurityTab = ({
  canEdit = true,
  changePassword = changeTenantPassword,
  portalLabel = "Business Admin",
  supportsSessions = true,
  getSessions = getTenantSessions,
  revokeSession = revokeTenantSession,
  deleteSession = deleteTenantSession,
  revokeAllSessions = revokeAllTenantSessions,
}) => {
  const [sessions, setSessions] = useState(() =>
    !supportsSessions || typeof getSessions !== "function"
      ? [
          {
            id: "current-local",
            isCurrent: true,
            status: "active",
            deviceName: getCurrentDeviceName(),
            deviceType: "desktop",
            location: "Current browser · Active now",
          },
        ]
      : [],
  );
  const [isLoadingSessions, setIsLoadingSessions] = useState(
    () => supportsSessions && typeof getSessions === "function",
  );
  const [revokingId, setRevokingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  useEffect(() => {
    if (!supportsSessions || typeof getSessions !== "function") return;

    let isMounted = true;

    getSessions()
      .then((res) => {
        if (!isMounted) return;
        const list =
          (Array.isArray(res?.data) && res.data) ||
          (Array.isArray(res?.data?.items) && res.data.items) ||
          (Array.isArray(res?.data?.data) && res.data.data) ||
          (Array.isArray(res) && res) ||
          (Array.isArray(res?.items) && res.items) ||
          null;

        if (list) {
          setSessions(list);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSessions([
          {
            id: "current-local",
            isCurrent: true,
            status: "active",
            deviceName: getCurrentDeviceName(),
            deviceType: "desktop",
            location: "Current browser · Active now",
          },
        ]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSessions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getSessions, supportsSessions]);

  const handleRevokeSession = async (sessionId) => {
    if (!supportsSessions || typeof revokeSession !== "function") return;
    try {
      setRevokingId(sessionId);
      await revokeSession(sessionId);
      toast.success("Device logged out successfully");
      // Keep device in list but mark as Inactive / Logged out
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: "revoked",
                location: "Inactive · Logged out",
                revokedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to log out device"));
    } finally {
      setRevokingId(null);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!supportsSessions || typeof deleteSession !== "function") return;
    try {
      setDeletingId(sessionId);
      await deleteSession(sessionId);
      toast.success("Session removed successfully");
      // Remove permanently from list
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete session"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogoutAll = async () => {
    if (!supportsSessions || typeof revokeAllSessions !== "function") return;
    try {
      setIsLoggingOutAll(true);
      await revokeAllSessions();
      toast.success("All other active devices logged out successfully");
      // Mark all other sessions as Inactive / Logged out
      setSessions((prev) =>
        prev.map((s) =>
          s.isCurrent
            ? s
            : {
                ...s,
                status: "revoked",
                location: "Inactive · Logged out",
                revokedAt: new Date().toISOString(),
              },
        ),
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to log out all devices"));
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
        });

        resetForm();
        toast.success(response?.message || "Password changed successfully");
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to change password"));
      }
    },
  });

  const getPasswordError = (field) =>
    passwordFormik.touched[field] ? passwordFormik.errors[field] : "";

  const activeOtherSessionsCount = sessions.filter(
    (s) => !s.isCurrent && s.status === "active",
  ).length;

  return (
    <>
      <SettingsPanel
        description={`Update your ${portalLabel} account password`}
        title="Change Password"
      >
        <form
          className="space-y-5 p-5 sm:p-7"
          noValidate
          onSubmit={passwordFormik.handleSubmit}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              error={Boolean(getPasswordError("currentPassword"))}
              helperText={getPasswordError("currentPassword")}
              autoComplete="current-password"
              disabled={!canEdit || passwordFormik.isSubmitting}
              label="Current Password"
              name="currentPassword"
              onBlur={passwordFormik.handleBlur}
              onChange={(nextValue) =>
                passwordFormik.setFieldValue("currentPassword", nextValue)
              }
              placeholder="Enter current password"
              required
              type="password"
              value={passwordFormik.values.currentPassword}
            />
            <Input
              error={Boolean(getPasswordError("newPassword"))}
              helperText={getPasswordError("newPassword")}
              autoComplete="new-password"
              disabled={!canEdit || passwordFormik.isSubmitting}
              label="New Password"
              name="newPassword"
              onBlur={passwordFormik.handleBlur}
              onChange={(nextValue) =>
                passwordFormik.setFieldValue("newPassword", nextValue)
              }
              placeholder="At least 8 characters"
              required
              type="password"
              value={passwordFormik.values.newPassword}
            />
          </div>
          <div className="md:max-w-[calc(50%-0.625rem)]">
            <Input
              error={Boolean(getPasswordError("confirmNewPassword"))}
              helperText={getPasswordError("confirmNewPassword")}
              autoComplete="new-password"
              disabled={!canEdit || passwordFormik.isSubmitting}
              label="Confirm New Password"
              name="confirmNewPassword"
              onBlur={passwordFormik.handleBlur}
              onChange={(nextValue) =>
                passwordFormik.setFieldValue("confirmNewPassword", nextValue)
              }
              placeholder="Repeat new password"
              required
              type="password"
              value={passwordFormik.values.confirmNewPassword}
            />
          </div>
          <Button
            disabled={!canEdit}
            leftIcon={<KeyRound size={17} />}
            loading={passwordFormik.isSubmitting}
            type="submit"
          >
            Update Password
          </Button>
        </form>
      </SettingsPanel>

      <SettingsPanel
        action={
          <GlobalTooltip
            position="left"
            text="Log out all other active devices"
          >
            <Button
              disabled={
                !canEdit || isLoggingOutAll || activeOtherSessionsCount === 0
              }
              leftIcon={<LogOut size={16} />}
              loading={isLoggingOutAll}
              onClick={handleLogoutAll}
              size="sm"
              variant="danger"
            >
              Log out all devices
            </Button>
          </GlobalTooltip>
        }
        description="Manage devices currently logged into your account"
        title="Active Sessions"
      >
        <div className="space-y-3 p-5 sm:p-7">
          {isLoadingSessions ? (
            <div className="space-y-3" aria-label="Loading active sessions">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-(--theme-border-soft) bg-(--theme-surface) p-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-(--theme-surface-strong)" />
                    <div className="space-y-2">
                      <div className="h-4 w-36 rounded bg-(--theme-surface-strong)" />
                      <div className="h-3 w-48 rounded bg-(--theme-surface-strong)" />
                    </div>
                  </div>
                  <div className="h-8 w-20 rounded-lg bg-(--theme-surface-strong)" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {sessions.map((session) => {
                const isCurrent = Boolean(session.isCurrent);
                const isActive = session.status === "active";
                const isInactive = !isActive && !isCurrent;
                const IconComponent =
                  session.deviceType === "mobile"
                    ? Smartphone
                    : session.deviceType === "tablet"
                      ? Tablet
                      : Monitor;

                return (
                  <div
                    key={session.id}
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                      isInactive
                        ? "border-(--theme-border-soft)/60 bg-(--theme-surface-strong)/60 opacity-80 hover:opacity-100"
                        : "border-(--theme-border-soft) bg-(--theme-surface-strong)"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${
                          isInactive
                            ? "bg-(--button-ghost-bg) text-(--theme-text-muted)"
                            : "bg-(--button-ghost-bg-hover) text-(--theme-text-secondary)"
                        }`}
                      >
                        <IconComponent size={20} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`m-0 truncate text-sm font-bold ${
                              isInactive
                                ? "text-(--theme-text-secondary)"
                                : "text-(--theme-text-primary)"
                            }`}
                          >
                            {session.deviceName || getCurrentDeviceName()}
                          </h3>
                          {isCurrent && (
                            <span className="rounded-md bg-[rgba(34,197,94,0.14)] px-2 py-0.5 text-xs font-black text-(--color-fresh-mint)">
                              Current
                            </span>
                          )}
                          {!isCurrent && isActive && (
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                              Active
                            </span>
                          )}
                          {isInactive && (
                            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="mb-0 mt-1 flex flex-wrap items-center gap-2 text-xs text-(--theme-text-muted)">
                          <span className="flex items-center gap-1.5">
                            <MapPin
                              size={13}
                              className={
                                isInactive
                                  ? "text-(--theme-text-muted)"
                                  : "text-(--color-aurora-teal)"
                              }
                            />
                            {session.location ||
                              (isInactive
                                ? "Inactive · Logged out"
                                : "Active Location")}
                          </span>
                          {session.ipAddress && (
                            <>
                              <span>·</span>
                              <span>IP: {session.ipAddress}</span>
                            </>
                          )}
                          {!isCurrent &&
                            (session.revokedAt || session.lastActive) && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>
                                    {isInactive
                                      ? "Logged out "
                                      : "Last active "}
                                    {formatDateTime(
                                      session.revokedAt || session.lastActive,
                                      true,
                                    )}
                                  </span>
                                </span>
                              </>
                            )}
                        </p>
                      </div>
                    </div>

                    {!isCurrent && (
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <GlobalTooltip position="top" text="Log out device">
                            <button
                              type="button"
                              aria-label="Log out device"
                              disabled={
                                !canEdit ||
                                revokingId === session.id ||
                                deletingId === session.id
                              }
                              onClick={() => handleRevokeSession(session.id)}
                              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {revokingId === session.id ? (
                                <LoaderCircle
                                  className="animate-spin"
                                  size={16}
                                />
                              ) : (
                                <LogOut size={16} />
                              )}
                            </button>
                          </GlobalTooltip>
                        )}

                        <GlobalTooltip position="top" text="Delete session">
                          <button
                            type="button"
                            aria-label="Delete session"
                            disabled={
                              !canEdit ||
                              deletingId === session.id ||
                              revokingId === session.id
                            }
                            onClick={() => handleDeleteSession(session.id)}
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--theme-border-soft) bg-(--button-ghost-bg) text-(--theme-text-muted) transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === session.id ? (
                              <LoaderCircle
                                className="animate-spin"
                                size={16}
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </GlobalTooltip>
                      </div>
                    )}
                  </div>
                );
              })}

              {activeOtherSessionsCount === 0 && (
                <div className="flex items-center gap-2 pt-1 text-xs text-(--theme-text-muted)">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span>
                    Your account is currently only active on this device.
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </SettingsPanel>
    </>
  );
};

export default SecurityTab;
