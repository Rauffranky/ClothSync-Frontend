import TenantStaffRoles from "../../Tenant/StaffRoles";
import {
  createLaundryStaffRole,
  getLaundryAccessSections,
  getLaundryStaffRoleDetails,
  getLaundryStaffRoles,
  updateLaundryStaffRole,
  updateLaundryStaffRoleStatus,
} from "../../../axios/laundryStaff/laundryStaff";
import { hasPermission } from "../../../Utils/permissions";

const LaundryStaffRoles = () => (
  <TenantStaffRoles
    createStaffRole={createLaundryStaffRole}
    getAccessSections={getLaundryAccessSections}
    getStaffRoleDetails={getLaundryStaffRoleDetails}
    getStaffRoles={getLaundryStaffRoles}
    updateStaffRole={updateLaundryStaffRole}
    updateStaffRoleStatus={updateLaundryStaffRoleStatus}
    permissions={{
      create: hasPermission("staff", "create"),
      edit: hasPermission("staff", "edit"),
    }}
  />
);

export default LaundryStaffRoles;
