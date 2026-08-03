import { formatDateTime } from "../../../Utils/date";
import { formatStatusLabel } from "../../../Utils/status";

const titleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getInitials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";

const getPermissionVariant = (permission) => {
  if (permission === "Full Access") return "info";
  if (permission === "Limited Access") return "purple";
  return "neutral";
};

const getStatusVariant = (status) => {
  if (status === "Active") return "success";
  if (status === "Suspend") return "warning";
  return "danger";
};

export const staffPermissionActions = [
  { key: "canView", sourceKey: "view", label: "View" },
  { key: "canCreate", sourceKey: "create", label: "Create" },
  { key: "canEdit", sourceKey: "edit", label: "Edit" },
  { key: "canDelete", sourceKey: "delete", label: "Delete" },
  { key: "canExport", sourceKey: "export", label: "Export" },
  { key: "canApprove", sourceKey: "approve", label: "Approve" },
];

const normalizeStaffPermissions = (permissions) => {
  const permissionRows = Array.isArray(permissions)
    ? permissions.map((permission, index) => [
        permission?.sectionKey || permission?.key || `module-${index}`,
        permission,
      ])
    : Object.entries(permissions || {});

  return permissionRows.map(([sectionKey, permission], index) => ({
    id: permission?.id || sectionKey || `permission-${index}`,
    sectionKey,
    sectionName: titleCase(
      permission?.sectionName || permission?.name || sectionKey,
    ),
    ...staffPermissionActions.reduce(
      (actions, action) => ({
        ...actions,
        [action.key]: Boolean(
          permission?.[action.key] ?? permission?.[action.sourceKey],
        ),
      }),
      {},
    ),
  }));
};

const getStaffRows = (payload) => {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.items ||
      payload?.staff ||
      payload?.staffMembers ||
      payload?.members ||
      payload?.docs ||
      payload?.results ||
      [];

  return Array.isArray(rows) ? rows : [];
};

export const normalizeStaffMember = (staff, index = 0) => {
  const user = staff?.user || {};
  const role =
    (typeof staff?.staffRole === "object" && staff.staffRole) ||
    (typeof staff?.role === "object" && staff.role) ||
    {};
  const location = staff?.location || {};
  const rawName =
    staff?.fullName || staff?.name || user?.fullName || user?.name || "Unnamed Staff";
  const rawStatus = String(staff?.status || user?.status || "inactive").toLowerCase();
  const status = formatStatusLabel(rawStatus, "");
  const permission = titleCase(
    role?.accessLevel ||
      staff?.accessLevel ||
      staff?.permissionLevel ||
      "view_only",
  );

  return {
    ...staff,
    id: staff?.id || staff?._id || `staff-${index}`,
    apiId: staff?.id || staff?._id,
    name: rawName,
    initials: getInitials(rawName),
    email: staff?.email || user?.email || "-",
    phone: staff?.phone || user?.phone || "-",
    staffRoleId:
      staff?.staffRoleId ||
      role?.id ||
      role?._id ||
      (typeof staff?.roleId === "string" ? staff.roleId : null),
    role:
      role?.name ||
      role?.roleName ||
      (typeof staff?.staffRole === "string" ? staff.staffRole : null) ||
      staff?.roleName ||
      (typeof staff?.role === "string" ? staff.role : "-") ||
      "-",
    locationId:
      staff?.locationId ||
      location?.id ||
      location?._id ||
      null,
    location:
      staff?.locationName ||
      location?.name ||
      location?.title ||
      (typeof staff?.location === "string" ? staff.location : "-") ||
      "-",
    permission,
    permissionVariant: getPermissionVariant(permission),
    status,
    statusVariant: getStatusVariant(status),
    language: staff?.language || staff?.locale || "en",
    emailVerified: Boolean(
      staff?.emailVerified ??
        staff?.isEmailVerified ??
        staff?.verifiedAt ??
        user?.emailVerified ??
        user?.isEmailVerified ??
        user?.verifiedAt,
    ),
    sendInvite: Boolean(staff?.sendInvite),
    lastActive:
      formatDateTime(
        staff?.lastActiveAt || staff?.lastLoginAt || staff?.updatedAt,
        true,
      ) || "-",
    createdAt: staff?.createdAt || null,
    updatedAt: staff?.updatedAt || null,
    permissions: normalizeStaffPermissions(staff?.permissions),
    avatarVariant: ["info", "purple", "success", "warning", "danger"][
      index % 5
    ],
  };
};

export const getStaffPaginatedCollection = (response, page, limit) => {
  const payload = response?.data ?? response ?? {};
  const allRows = getStaffRows(payload);
  const pagination = payload?.pagination || response?.pagination || null;
  const hasServerPagination = Boolean(pagination);
  const totalItems = Number(
    pagination?.totalItems ??
      pagination?.totalDocs ??
      pagination?.total ??
      allRows.length,
  );
  const totalPages = Number(
    pagination?.totalPages ??
      pagination?.pages ??
      Math.ceil(totalItems / limit),
  );
  const rows = hasServerPagination
    ? allRows
    : allRows.slice((page - 1) * limit, page * limit);
  return {
    rows,
    summary:
      payload?.counts ??
      payload?.summary ??
      response?.counts ??
      response?.summary ??
      null,
    totalItems: Number.isFinite(totalItems) ? totalItems : 0,
    totalPages: Number.isFinite(totalPages) ? totalPages : 0,
  };
};

const getSummaryCount = (...values) => {
  const value = values.find((item) => item !== null && item !== undefined);
  if (value === undefined) return null;

  const count = Number(value);
  return Number.isFinite(count) ? count : null;
};

export const normalizeStaffSummary = (response) => {
  const payload = response?.data ?? response ?? {};
  const summarySource =
    payload?.counts ?? payload?.summary ?? payload?.stats ?? payload;
  const summary = Array.isArray(summarySource)
    ? Object.fromEntries(
        summarySource
          .filter((item) => item?.key)
          .map((item) => [item.key, getSummaryCount(item.count)]),
      )
    : summarySource;

  return {
    totalStaff: getSummaryCount(
      summary?.totalStaff,
      summary?.totalStaffMembers,
      summary?.totalRoles,
      summary?.total,
    ),
    activeStaff: getSummaryCount(
      summary?.activeStaff,
      summary?.activeStaffMembers,
      summary?.activeRoles,
      summary?.active,
    ),
    inactiveStaff: getSummaryCount(
      summary?.inactiveStaff,
      summary?.inactiveStaffMembers,
      summary?.inactiveRoles,
      summary?.inactive,
    ),
  };
};

export const normalizeStaffDetails = (response) => {
  const payload = response?.data ?? response ?? {};
  const staff = payload?.staff || payload?.staffMember || payload?.member || payload;

  return normalizeStaffMember(staff);
};

export const createStaffRoleOptions = (roles) => [
  { label: "All Roles", value: "all" },
  ...roles.map((role) => ({
    label: role.name,
    value: role.apiId || role.id,
  })),
];

export const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspend", value: "suspend" },
];
