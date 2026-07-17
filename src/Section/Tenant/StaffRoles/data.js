const titleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const permissionActions = [
  { key: "canView", label: "View", aliases: ["view"] },
  { key: "canCreate", label: "Create", aliases: ["create"] },
  { key: "canEdit", label: "Edit", aliases: ["edit", "update"] },
  { key: "canDelete", label: "Delete", aliases: ["delete"] },
  { key: "canExport", label: "Export", aliases: ["export"] },
  { key: "canApprove", label: "Approve", aliases: ["approve"] },
];

const getPermissionValue = (permission, action) =>
  [action.key, ...action.aliases].some(
    (key) => permission?.[key] === true,
  );

const normalizeRolePermission = (permission, index) => {
  const section = permission?.section || permission?.accessSection || {};
  const sectionKey = String(
    permission?.sectionKey ||
      permission?.accessSectionKey ||
      section?.sectionKey ||
      section?.key ||
      section?.slug ||
      section?.code ||
      section?.id ||
      "",
  );

  if (!sectionKey) return null;

  return {
    id: permission?.id || section?.id || sectionKey || index,
    sectionKey,
    sectionName: titleCase(
      permission?.sectionName ||
        section?.sectionName ||
        section?.name ||
        section?.label ||
        section?.title ||
        sectionKey,
    ),
    ...permissionActions.reduce(
      (values, action) => ({
        ...values,
        [action.key]: getPermissionValue(permission, action),
      }),
      {},
    ),
  };
};

const getRolePermissionCollection = (role, payload) => {
  const permissions =
    role?.modulePermissions ||
    role?.permissions ||
    role?.rolePermissions ||
    payload?.modulePermissions ||
    payload?.permissions ||
    payload?.rolePermissions ||
    [];

  return Array.isArray(permissions) ? permissions : [];
};

const getPermissionSectionCollection = (response) => {
  const payload = response?.data ?? response ?? {};
  const rows = Array.isArray(payload)
    ? payload
    : payload?.sections ||
      payload?.accessSections ||
      payload?.permissionSections ||
      payload?.items ||
      [];

  return Array.isArray(rows) ? rows : [];
};

const getAvailablePermissionKeys = (section) => {
  const source =
    section?.availablePermissions ||
    section?.allowedPermissions ||
    section?.permissions ||
    section?.actions ||
    section?.availableActions;

  if (Array.isArray(source)) {
    return source.map((permission) =>
      String(
        typeof permission === "string"
          ? permission
          : permission?.key || permission?.name || permission?.action || "",
      ).toLowerCase(),
    );
  }

  if (source && typeof source === "object") {
    return Object.entries(source)
      .filter(([, isAvailable]) => Boolean(isAvailable))
      .map(([key]) => key.toLowerCase());
  }

  const explicitAvailability = permissionActions.filter(({ key, aliases }) =>
    [key, ...aliases].some((permissionKey) =>
      Object.prototype.hasOwnProperty.call(section || {}, permissionKey),
    ),
  );

  if (explicitAvailability.length > 0) {
    return explicitAvailability
      .filter(({ key, aliases }) =>
        [key, ...aliases].some(
          (permissionKey) => section?.[permissionKey] === true,
        ),
      )
      .flatMap(({ key, aliases }) => [key.toLowerCase(), ...aliases]);
  }

  return permissionActions.flatMap(({ key, aliases }) => [
    key.toLowerCase(),
    ...aliases,
  ]);
};

export const normalizePermissionSections = (response) =>
  getPermissionSectionCollection(response)
    .map((section, index) => {
      const sectionKey = String(
        section?.sectionKey ||
          section?.key ||
          section?.slug ||
          section?.code ||
          section?.id ||
          "",
      );
      const availableKeys = getAvailablePermissionKeys(section);

      if (!sectionKey) return null;

      return {
        id: section?.id || sectionKey || index,
        sectionKey,
        name: titleCase(
          section?.sectionName ||
            section?.name ||
            section?.label ||
            section?.title ||
            sectionKey,
        ),
        availablePermissions: permissionActions.reduce(
          (permissions, action) => ({
            ...permissions,
            [action.key]: [action.key.toLowerCase(), ...action.aliases].some(
              (key) => availableKeys.includes(key),
            ),
          }),
          {},
        ),
      };
    })
    .filter(Boolean);

const getAccessVariant = (accessLevel) => {
  if (accessLevel === "Full Access") return "info";
  if (accessLevel === "Limited Access") return "purple";
  return "neutral";
};

const getLocationsLabel = (role) => {
  if (role?.allLocations || role?.hasAllLocations) return "All Locations";

  if (Array.isArray(role?.locations)) {
    if (role.locations.length === 0) return "No Locations";
    if (role.locations.every((location) => typeof location === "string")) {
      return role.locations.join(", ");
    }

    return role.locations
      .map((location) => location?.name || location?.title)
      .filter(Boolean)
      .join(", ") || `${role.locations.length} Locations`;
  }

  const locationCount = Number(role?.locationCount ?? role?.locationsCount);
  if (Number.isFinite(locationCount)) {
    return `${locationCount} ${locationCount === 1 ? "Location" : "Locations"}`;
  }

  return role?.location || role?.locationName || "-";
};

export const getStaffRolePaginatedCollection = (response, limit) => {
  const payload = response?.data ?? response ?? {};
  const rows = Array.isArray(payload)
    ? payload
    : payload?.items ||
      payload?.roles ||
      payload?.staffRoles ||
      payload?.docs ||
      payload?.results ||
      [];
  const pagination = payload?.pagination || response?.pagination || {};
  const totalItems = Number(
    pagination?.totalItems ?? pagination?.total ?? rows.length,
  );
  const totalPages = Number(
    pagination?.totalPages ?? Math.ceil(totalItems / limit),
  );

  return {
    rows: Array.isArray(rows) ? rows : [],
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

export const normalizeStaffRole = (role) => {
  const rawStatus = String(role?.status || "inactive").toLowerCase();
  const status = titleCase(rawStatus) || "Inactive";
  const accessLevel = titleCase(
    role?.accessLevel || role?.permissionLevel || role?.permission || "view_only",
  );

  return {
    ...role,
    id: role?.id || role?._id || role?.slug || role?.name,
    apiId: role?.id || role?._id,
    name: role?.roleName || role?.name || role?.title || "Unnamed Role",
    description: role?.description || "-",
    staffCount: Number(
      role?.numberOfStaff ??
        role?.staffCount ??
        role?.assignedStaffCount ??
        role?.usersCount ??
        role?.membersCount ??
        0,
    ),
    accessLevel,
    accessVariant: getAccessVariant(accessLevel),
    locations: getLocationsLabel(role),
    status,
    statusVariant: rawStatus === "active" ? "success" : "neutral",
    lastUpdated: role?.updatedAt || role?.lastUpdated || role?.createdAt || null,
  };
};

export const normalizeStaffRoleDetails = (response) => {
  const payload = response?.data ?? response ?? {};
  const role = payload?.role || payload?.staffRole || payload;
  const normalizedRole = normalizeStaffRole(role);

  return {
    ...normalizedRole,
    permissions: getRolePermissionCollection(role, payload)
      .map(normalizeRolePermission)
      .filter(Boolean),
  };
};

const getSummaryCount = (...values) => {
  const value = values.find((item) => item !== null && item !== undefined);
  if (value === undefined) return null;

  const count = Number(value);
  return Number.isFinite(count) ? count : null;
};

export const normalizeStaffRoleSummary = (response) => {
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
    totalRoles: getSummaryCount(summary?.totalRoles),
    fullAccessRoles: getSummaryCount(summary?.fullAccessRoles),
    viewOnlyRoles: getSummaryCount(summary?.viewOnlyRoles),
    limitedAccessRoles: getSummaryCount(summary?.limitedAccessRoles),
    activeRoles: getSummaryCount(summary?.activeRoles),
    inactiveRoles: getSummaryCount(summary?.inactiveRoles),
  };
};

export const roleStatusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export const accessLevelOptions = [
  { label: "All Access Levels", value: "all" },
  { label: "Full Access", value: "Full Access" },
  { label: "Limited Access", value: "Limited Access" },
  { label: "View Only", value: "View Only" },
];

export const accessLevelApiValues = {
  "Full Access": "full_access",
  "Limited Access": "limited_access",
  "View Only": "view_only",
};
