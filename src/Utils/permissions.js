import { getAuthSessionUser } from "../axios/auth/authSession";

const PERMISSION_ACTIONS = Object.freeze([
  "view",
  "create",
  "edit",
  "delete",
  "export",
  "approve",
]);

export const getUserPermissions = (user = getAuthSessionUser()) => {
  const permissions = user?.permissions;

  return permissions &&
    typeof permissions === "object" &&
    !Array.isArray(permissions)
    ? permissions
    : null;
};

export const hasPermission = (
  sectionKey,
  action = "view",
  user = getAuthSessionUser(),
) => {
  if (!sectionKey) return true;
  if (!PERMISSION_ACTIONS.includes(action)) return false;

  const permissions = getUserPermissions(user);

  // Owners/admins currently do not receive a permissions matrix. Preserve
  // their full portal access; staff responses include the matrix explicitly.
  if (!permissions) return true;

  return permissions[sectionKey]?.[action] === true;
};

export const getFirstPermittedHref = (items = [], user = getAuthSessionUser()) => {
  for (const item of items) {
    const candidates = Array.isArray(item.items) ? item.items : [item];

    for (const candidate of candidates) {
      if (hasPermission(candidate.permissionKey, "view", user)) {
        return candidate.href;
      }
    }
  }

  return null;
};
