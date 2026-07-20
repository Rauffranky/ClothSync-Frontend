import TenantSettings from "../../Tenant/Settings";
import { changeLaundryPassword } from "../../../axios/auth/laundryAuth";
import {
  getLaundryNotificationPreferences,
  updateLaundryNotificationPreferences,
} from "../../../axios/notifications/laundryNotificationPreferences";
import {
  getLaundrySettingsDateFormats,
  getLaundrySettingsProfile,
  getLaundrySettingsTimeZones,
  updateLaundrySettingsProfile,
} from "../../../axios/settings/laundrySettings";
import { hasPermission } from "../../../Utils/permissions";

const generalTabProps = {
  canEdit: hasPermission("settings", "edit"),
  displayNameField: "companyName",
  displayNameLabel: "Laundry Company Name",
  displayNamePlaceholder: "Enter laundry company name",
  getDateFormats: getLaundrySettingsDateFormats,
  getProfile: getLaundrySettingsProfile,
  getTimeZones: getLaundrySettingsTimeZones,
  logoLabel: "Laundry Logo",
  logoPreviewAlt: "Laundry logo preview",
  removeLogoAriaLabel: "Remove laundry logo",
  panelDescription: "Update your laundry company name and branding",
  panelTitle: "Laundry Profile",
  updateProfile: updateLaundrySettingsProfile,
};

const notificationTabProps = {
  canEdit: hasPermission("settings", "edit"),
  getPreferences: getLaundryNotificationPreferences,
  updatePreferences: updateLaundryNotificationPreferences,
};

const securityTabProps = {
  canEdit: hasPermission("settings", "edit"),
  changePassword: changeLaundryPassword,
  portalLabel: "Laundry Admin",
};

const LaundrySettings = () => (
  <TenantSettings
    generalTabProps={generalTabProps}
    notificationTabProps={notificationTabProps}
    securityTabProps={securityTabProps}
  />
);

export default LaundrySettings;
