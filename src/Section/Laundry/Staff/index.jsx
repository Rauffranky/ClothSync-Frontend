import TenantStaff from "../../Tenant/Staff";
import {
  createLaundryStaff,
  getLaundryStaff,
  getLaundryStaffDetails,
  getLaundryStaffRoles,
  updateLaundryStaff,
  updateLaundryStaffStatus,
} from "../../../axios/laundryStaff/laundryStaff";
import { hasPermission } from "../../../Utils/permissions";

const LaundryStaff = () => (
  <TenantStaff
    createStaff={createLaundryStaff}
    getStaffDetails={getLaundryStaffDetails}
    getStaffMembers={getLaundryStaff}
    getStaffRoles={getLaundryStaffRoles}
    updateStaff={updateLaundryStaff}
    updateStaffStatus={updateLaundryStaffStatus}
    permissions={{
      create: hasPermission("staff", "create"),
      edit: hasPermission("staff", "edit"),
    }}
  />
);

export default LaundryStaff;
