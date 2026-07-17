import TenantStaffRoles from "../../Tenant/StaffRoles";
import {
  createLaundryStaffRole,
  getLaundryAccessSections,
  getLaundryStaffRoleDetails,
  getLaundryStaffRoles,
  updateLaundryStaffRole,
  updateLaundryStaffRoleStatus,
} from "../../../axios/laundryStaff/laundryStaff";

const LaundryStaffRoles = () => (
  <TenantStaffRoles
    createStaffRole={createLaundryStaffRole}
    getAccessSections={getLaundryAccessSections}
    getStaffRoleDetails={getLaundryStaffRoleDetails}
    getStaffRoles={getLaundryStaffRoles}
    updateStaffRole={updateLaundryStaffRole}
    updateStaffRoleStatus={updateLaundryStaffRoleStatus}
  />
);

export default LaundryStaffRoles;
