import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { Check, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import * as Yup from "yup";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import {
  createTenantStaffRole,
  getTenantAccessSections,
  getTenantStaffRoleDetails,
  updateTenantStaffRole,
} from "../../../axios/staffRoles/tenantStaffRoles";
import { toast } from "../../../Utils/toast";
import {
  normalizePermissionSections,
  normalizeStaffRoleDetails,
  permissionActions,
} from "./data";

const createPermissionValues = (
  sections,
  selected = false,
  savedPermissions = [],
) =>
  sections.map((section) => {
    const savedPermission = savedPermissions.find(
      (permission) => permission.sectionKey === section.sectionKey,
    );

    return {
      sectionKey: section.sectionKey,
      ...permissionActions.reduce(
        (values, action) => ({
          ...values,
          [action.key]:
            section.availablePermissions[action.key] &&
            (selected || Boolean(savedPermission?.[action.key])),
        }),
        {},
      ),
    };
  });

const getSelectedPermissions = (permissions) =>
  permissions.reduce((selectedPermissions, permission) => {
    const isModuleSelected = permissionActions.some(
      (action) => permission[action.key],
    );

    if (!isModuleSelected) {
      return selectedPermissions;
    }

    return [
      ...selectedPermissions,
      {
        sectionKey: permission.sectionKey,
        ...permissionActions.reduce(
          (actions, action) => ({
            ...actions,
            [action.key]: Boolean(permission[action.key]),
          }),
          {},
        ),
      },
    ];
  }, []);

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(100, "Role name cannot exceed 100 characters")
    .required("Role name is required"),
  description: Yup.string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),
  permissions: Yup.array(),
});

const PermissionTableSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-(--theme-border)">
    <div className="h-12 bg-(--theme-surface-hover)" />
    {Array.from({ length: 6 }, (_, index) => (
      <div
        className="flex h-14 items-center gap-5 border-t border-(--theme-border) px-4"
        key={index}
      >
        <span className="h-4 w-36 rounded bg-(--theme-surface-hover)" />
        <span className="ml-auto h-5 w-5 rounded bg-(--theme-surface-hover)" />
        <span className="h-5 w-5 rounded bg-(--theme-surface-hover)" />
        <span className="h-5 w-5 rounded bg-(--theme-surface-hover)" />
      </div>
    ))}
  </div>
);

const CreateRoleModal = ({
  createStaffRole = createTenantStaffRole,
  getAccessSections = getTenantAccessSections,
  getStaffRoleDetails = getTenantStaffRoleDetails,
  onClose,
  onSaved,
  open,
  role = null,
  updateStaffRole = updateTenantStaffRole,
}) => {
  const [sections, setSections] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState("");
  const [sectionsRefreshKey, setSectionsRefreshKey] = useState(0);
  const isEditing = Boolean(role);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      status: "active",
      permissions: [],
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const payload = {
          name: values.name.trim(),
          description: values.description.trim(),
          status: values.status,
          permissions: getSelectedPermissions(values.permissions),
        };
        const roleId = role?.apiId || role?.id;
        const response = isEditing
          ? await updateStaffRole(roleId, payload)
          : await createStaffRole(payload);
        toast.success(
          response?.message ||
            (isEditing
              ? "Staff role updated successfully"
              : "Staff role created successfully"),
        );
        helpers.resetForm();
        onSaved?.();
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            isEditing
              ? "Unable to update staff role"
              : "Unable to create staff role",
          ),
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  const { setFieldValue } = formik;

  useEffect(() => {
    let isActive = true;

    const detailRequest = isEditing
      ? getStaffRoleDetails(role?.apiId || role?.id)
      : Promise.resolve(null);

    Promise.all([getAccessSections(), detailRequest])
      .then(([sectionsResponse, detailResponse]) => {
        if (!isActive) return;
        const normalizedSections = normalizePermissionSections(sectionsResponse);
        const roleDetails = detailResponse
          ? normalizeStaffRoleDetails(detailResponse)
          : null;
        setSections(normalizedSections);
        setFieldValue("name", roleDetails?.name || "", false);
        setFieldValue(
          "description",
          roleDetails?.description === "-" ? "" : roleDetails?.description || "",
          false,
        );
        setFieldValue(
          "status",
          roleDetails?.status?.toLowerCase() || "active",
          false,
        );
        setFieldValue(
          "permissions",
          createPermissionValues(
            normalizedSections,
            false,
            roleDetails?.permissions,
          ),
          false,
        );
      })
      .catch((error) => {
        if (!isActive) return;
        setSections([]);
        setSectionsError(
          getApiErrorMessage(
            error,
            isEditing
              ? "Unable to load staff role details"
              : "Unable to load permission sections",
          ),
        );
      })
      .finally(() => {
        if (isActive) setIsLoadingSections(false);
      });

    return () => {
      isActive = false;
    };
  }, [
    getAccessSections,
    getStaffRoleDetails,
    isEditing,
    role?.apiId,
    role?.id,
    sectionsRefreshKey,
    setFieldValue,
  ]);

  const selectedPermissionCount = useMemo(
    () =>
      formik.values.permissions.reduce(
        (total, permission) =>
          total +
          permissionActions.filter((action) => permission[action.key]).length,
        0,
      ),
    [formik.values.permissions],
  );

  const setAllPermissions = (selected) => {
    formik.setFieldValue(
      "permissions",
      createPermissionValues(sections, selected),
      true,
    );
  };

  const setPermission = (sectionIndex, permissionKey, selected) => {
    const nextPermissions = formik.values.permissions.map(
      (permission, index) => {
        if (index !== sectionIndex) return permission;

        if (permissionKey === "canView" && !selected) {
          return permissionActions.reduce(
            (nextPermission, action) => ({
              ...nextPermission,
              [action.key]: false,
            }),
            permission,
          );
        }

        return {
          ...permission,
          [permissionKey]: selected,
          ...(selected && permissionKey !== "canView"
            ? { canView: true }
            : {}),
        };
      },
    );

    formik.setFieldValue(
      "permissions",
      nextPermissions,
      true,
    );
  };

  const handleClose = () => {
    if (!formik.isSubmitting) onClose?.();
  };

  return (
    <Modal
      closeOnBackdrop={false}
      description={
        isEditing
          ? "Update role details and module permissions."
          : "Define role details and choose which modules this role can access."
      }
      footer={
        <>
          <Button
            disabled={formik.isSubmitting}
            onClick={handleClose}
            size="sm"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoadingSections || sections.length === 0}
            form="create-staff-role-form"
            leftIcon={<Check size={17} />}
            loading={formik.isSubmitting}
            size="sm"
            type="submit"
          >
            {isEditing ? "Update Role" : "Create Role"}
          </Button>
        </>
      }
      onClose={handleClose}
      open={open}
      title={isEditing ? "Edit Role" : "Create New Role"}
      width={1040}
    >
      <form
        className="space-y-6"
        id="create-staff-role-form"
        onSubmit={formik.handleSubmit}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            disabled={formik.isSubmitting}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name ? formik.errors.name : ""}
            label="Role Name"
            name="name"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("name", value)}
            placeholder="e.g. Inventory Staff"
            required
            value={formik.values.name}
          />
          <Input
            disabled={formik.isSubmitting}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={
              formik.touched.description ? formik.errors.description : ""
            }
            label="Description"
            name="description"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("description", value)}
            placeholder="Brief description of this role's responsibilities..."
            value={formik.values.description}
          />
        </div>

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="m-0 text-base font-bold text-(--theme-text-primary)">
                Module Permissions
              </h3>
              <p className="m-0 mt-1 text-sm font-medium text-(--theme-text-muted)">
                Control module access and available actions for this role.
              </p>
            </div>

            {!isLoadingSections && sections.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Button
                  disabled={formik.isSubmitting}
                  onClick={() => setAllPermissions(true)}
                  size="sm"
                  variant="link"
                >
                  Select All
                </Button>
                <span className="text-(--theme-text-muted)">•</span>
                <Button
                  disabled={formik.isSubmitting || selectedPermissionCount === 0}
                  onClick={() => setAllPermissions(false)}
                  size="sm"
                  variant="link"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {isLoadingSections && <PermissionTableSkeleton />}

          {!isLoadingSections && sectionsError && (
            <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{sectionsError}</span>
                <Button
                  leftIcon={<RefreshCw size={15} />}
                  onClick={() => {
                    setIsLoadingSections(true);
                    setSectionsError("");
                    setSectionsRefreshKey((current) => current + 1);
                  }}
                  size="sm"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </Alert>
          )}

          {!isLoadingSections && !sectionsError && sections.length === 0 && (
            <Alert leftIcon={<ShieldCheck size={18} />} variant="info">
              No permission sections are available.
            </Alert>
          )}

          {!isLoadingSections && sections.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-(--theme-border)">
              <table className="w-full min-w-190 border-collapse">
                <thead className="bg-(--theme-surface-hover)">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-(--theme-text-muted)">
                      Module
                    </th>
                    {permissionActions.map((action) => (
                      <th
                        className="px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-(--theme-text-muted)"
                        key={action.key}
                      >
                        {action.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section, sectionIndex) => (
                    <tr
                      className="border-t border-(--theme-border)"
                      key={section.id}
                    >
                      <th className="px-4 py-3 text-left text-sm font-bold text-(--theme-text-primary)">
                        {section.name}
                      </th>
                      {permissionActions.map((action) => {
                        const isAvailable =
                          section.availablePermissions[action.key];
                        const isChecked = Boolean(
                          formik.values.permissions[sectionIndex]?.[action.key],
                        );

                        return (
                          <td className="px-3 py-3 text-center" key={action.key}>
                            {isAvailable ? (
                              <input
                                aria-label={`${section.name}: ${action.label}`}
                                checked={isChecked}
                                className="h-5 w-5 cursor-pointer accent-(--color-aurora-teal) disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={formik.isSubmitting}
                                onChange={(event) =>
                                  setPermission(
                                    sectionIndex,
                                    action.key,
                                    event.target.checked,
                                  )
                                }
                                type="checkbox"
                              />
                            ) : (
                              <span
                                aria-label={`${section.name}: ${action.label} unavailable`}
                                className="text-(--theme-text-muted)"
                              >
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </form>
    </Modal>
  );
};

export default CreateRoleModal;
