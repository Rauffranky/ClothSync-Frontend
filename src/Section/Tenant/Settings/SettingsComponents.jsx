import { Check, Mail, Monitor } from "lucide-react";
import Button from "../../../Components/UI/Button";
import Card from "../../../Components/UI/Card";
import Toggle from "../../../Components/UI/Toggle";

export const SettingsPanel = ({
  title,
  description,
  action,
  children,
  className = "",
}) => (
  <Card
    className={`overflow-hidden ${className}`}
    padding="0"
    rounded="18px"
    shadow="shadow-[0_14px_38px_rgba(15,23,42,0.06)]"
  >
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--theme-border-soft) px-5 py-5 sm:px-7">
      <div>
        <h2 className="m-0 text-base font-black text-(--theme-text-primary)">{title}</h2>
        {description && (
          <p className="mb-0 mt-1 text-sm font-medium text-(--theme-text-muted)">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
    {children}
  </Card>
);

export const FormActions = ({ disabled, loading = false, onDiscard, onSave }) => (
  <div className="flex flex-wrap gap-3 border-t border-(--theme-border-soft) pt-6">
    <Button
      disabled={disabled}
      leftIcon={<Check size={17} />}
      loading={loading}
      onClick={onSave}
      size="md"
    >
      Save Changes
    </Button>
    <Button disabled={disabled || loading} onClick={onDiscard} size="md" variant="ghost">
      Discard
    </Button>
  </div>
);

export const ChannelPreferences = ({ disabled = false, items, onChange }) => (
  <div className="px-5 sm:px-7">
    <div className="hidden grid-cols-[minmax(0,1fr)_130px_130px] border-b border-(--theme-border-soft) py-4 md:grid">
      <span />
      <span className="flex items-center gap-2 text-sm font-bold text-(--theme-text-secondary)">
        <Monitor size={16} /> In-app
      </span>
      <span className="flex items-center gap-2 text-sm font-bold text-(--theme-text-secondary)">
        <Mail size={16} /> Email
      </span>
    </div>
    {items.map((item) => (
      <div
        className="grid gap-4 border-b border-(--theme-border-soft) py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_130px_130px] md:items-center"
        key={item.id}
      >
        <div>
          <h3 className="m-0 text-sm font-bold text-(--theme-text-primary)">{item.title}</h3>
          <p className="mb-0 mt-1 text-sm text-(--theme-text-muted)">{item.description}</p>
        </div>
        <Toggle
          checked={item.inAppEnabled}
          disabled={disabled}
          label="In-app"
          onChange={(checked) =>
            onChange(item.notificationKey, "inAppEnabled", checked)
          }
        />
        <Toggle
          checked={item.emailEnabled}
          disabled={disabled}
          label="Email"
          onChange={(checked) =>
            onChange(item.notificationKey, "emailEnabled", checked)
          }
        />
      </div>
    ))}
  </div>
);
