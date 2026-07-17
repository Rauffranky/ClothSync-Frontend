import TenantStaff from "../../Tenant/Staff";
import {
  createLaundryStaff,
  getLaundryStaff,
  getLaundryStaffDetails,
  getLaundryStaffRoles,
  updateLaundryStaff,
  updateLaundryStaffStatus,
} from "../../../axios/laundryStaff/laundryStaff";

const LaundryStaff = () => (
  <TenantStaff
    createStaff={createLaundryStaff}
    getStaffDetails={getLaundryStaffDetails}
    getStaffMembers={getLaundryStaff}
    getStaffRoles={getLaundryStaffRoles}
    updateStaff={updateLaundryStaff}
    updateStaffStatus={updateLaundryStaffStatus}
  />
);

export default LaundryStaff;
