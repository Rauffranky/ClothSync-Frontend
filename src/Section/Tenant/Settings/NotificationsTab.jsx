import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import { getApiErrorMessage } from "../../../axios/api";
import {
  getTenantNotificationPreferences,
  updateTenantNotificationPreferences,
} from "../../../axios/notifications/tenantNotificationPreferences";
import { toast } from "../../../Utils/toast";
import { getNotificationPreferences } from "./data";
import {
  ChannelPreferences,
  FormActions,
  SettingsPanel,
} from "./SettingsComponents";

const NotificationPreferencesSkeleton = () => (
  <div aria-label="Loading notification preferences" className="px-5 sm:px-7">
    {Array.from({ length: 6 }, (_, index) => (
      <div
        className="grid animate-pulse gap-4 border-b border-(--theme-border-soft) py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_130px_130px] md:items-center"
        key={index}
      >
        <div className="space-y-2">
          <div className="h-4 w-56 max-w-full rounded bg-(--theme-border-soft)" />
          <div className="h-3 w-80 max-w-full rounded bg-(--theme-border-soft)" />
        </div>
        <div className="h-6 w-20 rounded-full bg-(--theme-border-soft)" />
        <div className="h-6 w-20 rounded-full bg-(--theme-border-soft)" />
      </div>
    ))}
  </div>
);

const NotificationsTab = ({
  canEdit = true,
  getPreferences = getTenantNotificationPreferences,
  updatePreferences = updateTenantNotificationPreferences,
}) => {
  const [savedPreferences, setSavedPreferences] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getPreferences()
      .then((response) => {
        if (!isActive) return;

        const nextPreferences = getNotificationPreferences(response);
        setSavedPreferences(nextPreferences);
        setPreferences(nextPreferences);
        setLoadError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setSavedPreferences([]);
        setPreferences([]);
        setLoadError(
          getApiErrorMessage(error, "Unable to load notification preferences"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [getPreferences, retryKey]);

  const isDirty = useMemo(
    () => JSON.stringify(preferences) !== JSON.stringify(savedPreferences),
    [preferences, savedPreferences],
  );

  const updateChannel = (notificationKey, channel, checked) => {
    setPreferences((current) =>
      current.map((preference) =>
        preference.notificationKey === notificationKey
          ? { ...preference, [channel]: checked }
          : preference,
      ),
    );
  };

  const savePreferences = async () => {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    try {
      const payload = preferences.map((preference) => ({
        notificationKey: preference.notificationKey,
        inAppEnabled: preference.inAppEnabled,
        emailEnabled: preference.emailEnabled,
      }));
      const response = await updatePreferences(payload);
      const updatedPreferences = getNotificationPreferences(response);
      const nextPreferences = updatedPreferences.length
        ? updatedPreferences
        : preferences;

      setSavedPreferences(nextPreferences);
      setPreferences(nextPreferences);
      toast.success(
        response?.message || "Notification preferences updated successfully",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update notification preferences"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const discardPreferences = () => {
    setPreferences(savedPreferences);
    toast.info("Unsaved changes discarded");
  };

  const retryLoad = () => {
    setIsLoading(true);
    setLoadError("");
    setRetryKey((current) => current + 1);
  };

  return (
    <>
      <SettingsPanel
        description="Choose how and when you receive alerts"
        title="Notification Preferences"
      >
        {isLoading ? (
          <NotificationPreferencesSkeleton />
        ) : loadError ? (
          <div className="p-5 sm:p-7">
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
          </div>
        ) : preferences.length ? (
          <ChannelPreferences
            disabled={!canEdit || isSaving}
            items={preferences}
            onChange={updateChannel}
          />
        ) : (
          <p className="m-0 px-5 py-8 text-center text-sm font-semibold text-(--theme-text-muted) sm:px-7">
            No notification preferences are available.
          </p>
        )}
      </SettingsPanel>

      {!isLoading && !loadError && preferences.length > 0 && (
        <FormActions
          disabled={!canEdit || !isDirty}
          loading={isSaving}
          onDiscard={discardPreferences}
          onSave={savePreferences}
        />
      )}
    </>
  );
};

export default NotificationsTab;
