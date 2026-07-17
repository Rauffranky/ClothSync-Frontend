import StaffEmailVerificationPage from "./StaffEmailVerificationPage";
import { verifyLaundryStaffEmail } from "../../axios/laundryStaff/laundryStaff";

const LaundryStaffEmailVerificationPage = () => (
  <StaffEmailVerificationPage
    loginPath="/laundry/login"
    verifyEmail={verifyLaundryStaffEmail}
  />
);

export default LaundryStaffEmailVerificationPage;
