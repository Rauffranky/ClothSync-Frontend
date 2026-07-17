import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ImagePlus, RefreshCw, Upload } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import CardSkeleton from "../../../Components/UI/CardSkeleton";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import { getApiErrorMessage } from "../../../axios/api";
import {
  getAuthSessionUser,
  setAuthSessionUser,
} from "../../../axios/auth/authSession";
import { uploadSingleFile } from "../../../axios/files/fileUpload";
import {
  getTenantSettingsDateFormats,
  getTenantSettingsProfile,
  getTenantSettingsTimeZones,
  updateTenantSettingsProfile,
} from "../../../axios/settings/tenantSettings";
import { toast } from "../../../Utils/toast";
import {
  getDateFormatOptions,
  getSettingsProfile,
  getTimeZoneOptions,
  getUploadedFileValue,
  languageOptions,
} from "./data";
import { FormActions, SettingsPanel } from "./SettingsComponents";

const emptyProfile = {
  businessName: "",
  avatar: null,
  language: "en",
  timezone: "UTC",
  dateFormat: "MM/DD/YYYY",
};

const profileValidationSchema = Yup.object({
  businessName: Yup.string().trim().required("Business display name is required"),
  language: Yup.string().oneOf(["en", "ar"]).required("Language is required"),
  timezone: Yup.string().required("Time zone is required"),
  dateFormat: Yup.string().required("Date format is required"),
});

const GeneralTab = () => {
  const logoInputRef = useRef(null);
  const [initialProfile, setInitialProfile] = useState(emptyProfile);
  const [timeZoneOptions, setTimeZoneOptions] = useState([]);
  const [dateFormatOptions, setDateFormatOptions] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialProfile,
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        let avatar = values.avatar;

        if (selectedLogo) {
          const uploadResponse = await uploadSingleFile(selectedLogo);
          avatar = getUploadedFileValue(uploadResponse);

          if (!avatar || typeof avatar !== "string") {
            throw new Error("The upload API did not return a valid file string");
          }
        }

        const payload = {
          businessName: values.businessName.trim(),
          avatar: avatar || null,
          language: values.language,
          timezone: values.timezone,
          dateFormat: values.dateFormat,
        };
        const response = await updateTenantSettingsProfile(payload);
        const updatedProfile = getSettingsProfile(response) || payload;
        const nextProfile = {
          ...payload,
          ...updatedProfile,
          businessName: updatedProfile.businessName || payload.businessName,
        };

        setInitialProfile(nextProfile);
        setSelectedLogo(null);
        setLogoPreview("");
        if (logoInputRef.current) logoInputRef.current.value = "";

        setAuthSessionUser({
          ...getAuthSessionUser(),
          ...nextProfile,
        });

        toast.success(response?.message || "Settings profile updated successfully");
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to update settings profile"));
      }
    },
  });

  useEffect(() => {
    let isActive = true;

    Promise.all([
      getTenantSettingsTimeZones(),
      getTenantSettingsDateFormats(),
      getTenantSettingsProfile(),
    ])
      .then(([timeZonesResponse, dateFormatsResponse, profileResponse]) => {
        if (!isActive) return;

        const nextTimeZones = getTimeZoneOptions(timeZonesResponse);
        const nextDateFormats = getDateFormatOptions(dateFormatsResponse);
        const profile = getSettingsProfile(profileResponse);

        if (!profile) throw new Error("Settings profile was not returned");
        if (!nextTimeZones.length) throw new Error("No time zones were returned");
        if (!nextDateFormats.length) throw new Error("No date formats were returned");

        setTimeZoneOptions(nextTimeZones);
        setDateFormatOptions(nextDateFormats);
        setInitialProfile({
          businessName: profile.businessName || profile.fullName || "",
          avatar: profile.avatar || null,
          language: profile.language || "en",
          timezone: profile.timezone || "UTC",
          dateFormat: profile.dateFormat || "MM/DD/YYYY",
        });
      })
      .catch((error) => {
        if (isActive) {
          setLoadError(
            getApiErrorMessage(error, "Unable to load general settings"),
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [retryKey]);

  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    },
    [logoPreview],
  );

  const getFieldError = (field) =>
    formik.touched[field] ? formik.errors[field] : "";

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Please select a PNG or JPG logo");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be 2 MB or smaller");
      event.target.value = "";
      return;
    }

    setSelectedLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const discardChanges = () => {
    formik.resetForm();
    setSelectedLogo(null);
    setLogoPreview("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRetryKey((current) => current + 1);
  };

  if (isLoading) {
    return (
      <div className="grid gap-5">
        <CardSkeleton lines={3} />
        <CardSkeleton lines={5} />
      </div>
    );
  }

  if (loadError) {
    return (
      <Alert leftIcon={<AlertTriangle size={18} />} variant="danger">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{loadError}</span>
          <Button
            leftIcon={<RefreshCw size={15} />}
            onClick={retryLoad}
            size="sm"
            variant="secondary"
          >
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <form className="space-y-7" noValidate onSubmit={formik.handleSubmit}>
      <SettingsPanel
        description="Update your business display name and branding"
        title="Business Profile"
      >
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2 lg:items-end">
          <Input
            error={Boolean(getFieldError("businessName"))}
            helperText={getFieldError("businessName")}
            label="Business Display Name"
            name="businessName"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("businessName", value)}
            placeholder="Enter business display name"
            required
            value={formik.values.businessName}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-(--theme-text-secondary)">
              Business Logo
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-(--theme-border) bg-(--button-secondary-bg) text-(--color-aurora-teal)">
                {logoPreview || formik.values.avatar ? (
                  <img
                    alt="Business logo preview"
                    className="h-full w-full object-cover"
                    src={logoPreview || formik.values.avatar}
                  />
                ) : (
                  <ImagePlus size={22} />
                )}
              </div>
              <input
                accept="image/png,image/jpeg"
                className="hidden"
                disabled={formik.isSubmitting}
                onChange={handleLogoChange}
                ref={logoInputRef}
                type="file"
              />
              <Button
                disabled={formik.isSubmitting}
                leftIcon={<Upload size={16} />}
                onClick={() => logoInputRef.current?.click()}
                size="sm"
                variant="outline"
              >
                Upload Logo
              </Button>
              <span className="text-sm font-medium text-(--theme-text-muted)">
                {selectedLogo?.name || "PNG, JPG up to 2 MB"}
              </span>
            </div>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel
        description="Set your locale, timezone, and default views"
        title="Regional & Display Preferences"
      >
        <div className="divide-y divide-(--theme-border-soft) px-5 py-2 sm:px-7">
          <div className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_340px] md:items-center">
            <div>
              <h3 className="m-0 text-sm font-bold text-(--theme-text-primary)">Time Zone</h3>
              <p className="mb-0 mt-1 text-sm text-(--theme-text-muted)">
                Used for scheduling and timestamps across all operations
              </p>
            </div>
            <div>
              <Dropdown
                disabled={formik.isSubmitting}
                onChange={(value) => formik.setFieldValue("timezone", value)}
                options={timeZoneOptions}
                search
                value={formik.values.timezone}
              />
              {getFieldError("timezone") && (
                <p className="mt-1.5 text-xs text-(--color-overdue)">{getFieldError("timezone")}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_340px] md:items-center">
            <div>
              <h3 className="m-0 text-sm font-bold text-(--theme-text-primary)">Default Language</h3>
              <p className="mb-0 mt-1 text-sm text-(--theme-text-muted)">
                Used for labels and localized content
              </p>
            </div>
            <Dropdown
              disabled={formik.isSubmitting}
              onChange={(value) => formik.setFieldValue("language", value)}
              options={languageOptions}
              value={formik.values.language}
            />
          </div>

          <div className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_340px] md:items-center">
            <div>
              <h3 className="m-0 text-sm font-bold text-(--theme-text-primary)">Date Format</h3>
              <p className="mb-0 mt-1 text-sm text-(--theme-text-muted)">
                Used when displaying dates throughout the portal
              </p>
            </div>
            <div>
              <Dropdown
                disabled={formik.isSubmitting}
                onChange={(value) => formik.setFieldValue("dateFormat", value)}
                options={dateFormatOptions}
                value={formik.values.dateFormat}
              />
              {getFieldError("dateFormat") && (
                <p className="mt-1.5 text-xs text-(--color-overdue)">{getFieldError("dateFormat")}</p>
              )}
            </div>
          </div>
        </div>
      </SettingsPanel>

      <FormActions
        disabled={!formik.dirty && !selectedLogo}
        loading={formik.isSubmitting}
        onDiscard={discardChanges}
        onSave={formik.submitForm}
      />
    </form>
  );
};

export default GeneralTab;
