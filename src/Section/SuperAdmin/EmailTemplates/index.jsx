import { useEffect, useState } from "react";
import {
  Mail,
  Save,
  Clock,
  Sparkles,
  Languages,
  Globe,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Code2,
  MousePointerClick,
  Eye,
  Settings2,
  Image as ImageIcon,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "../../../Utils/toast";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import Badge from "../../../Components/UI/Badge";
import Tabs from "../../../Components/UI/Tabs";
import Toggle from "../../../Components/UI/Toggle";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import QuillEditor from "../../../Components/UI/QuillEditor";
import Accordion, { AccordionItem } from "../../../Components/UI/Accordion";
import {
  getEmailTemplates,
  updateEmailTemplate,
} from "../../../axios/system/emailTemplates";

const VARIABLE_DEFINITIONS = {
  fullName: "Recipient full name",
  recipientName: "Recipient name or title",
  email: "User login email address",
  accountEmail: "Business account email",
  accountId: "System business account ID",
  businessName: "Name of the business",
  tenantName: "Inviting business name",
  temporaryPassword: "Auto-generated initial password",
  verificationUrl: "Account activation link",
  loginUrl: "Portal login address",
  roleName: "Assigned access role",
  otp: "One-time numeric security passcode",
  expiresAt: "Code/invite expiration duration",
  actionDescription: "Target action description",
  inviteUrl: "Partnership acceptance URL",
  message: "Personalized invitation note",
  planType: "Subscription tier name",
  approvedDate: "Date of administrator approval",
  actionUrl: "Review/action portal URL",
  reason: "Decision explanation notes",
};

const TEMPLATE_META = {
  tenant_account_creation: {
    title: "Business / Tenant Account Welcome",
    badge: "Tenant Onboarding",
    variables: [
      "fullName",
      "email",
      "temporaryPassword",
      "verificationUrl",
      "loginUrl",
    ],
  },
  laundry_account_creation: {
    title: "Laundry Facility Account Welcome",
    badge: "Laundry Onboarding",
    variables: [
      "fullName",
      "email",
      "temporaryPassword",
      "verificationUrl",
      "loginUrl",
    ],
  },
  otp_verification: {
    title: "Security OTP Verification Code",
    badge: "Security & Auth",
    variables: ["fullName", "otp", "expiresAt", "actionDescription"],
  },
  laundry_invitation: {
    title: "Laundry Collaboration Invitation",
    badge: "Partnership Invite",
    variables: ["tenantName", "email", "inviteUrl", "expiresAt", "message"],
  },
  staff_invitation: {
    title: "Staff Member Invitation",
    badge: "Staff Management",
    variables: [
      "fullName",
      "email",
      "temporaryPassword",
      "tenantName",
      "roleName",
      "verificationUrl",
      "loginUrl",
    ],
  },
  business_approval_request: {
    title: "New Business Approval Request",
    badge: "Compliance & Review",
    variables: [
      "recipientName",
      "businessName",
      "accountEmail",
      "accountId",
      "planType",
      "actionUrl",
    ],
  },
  business_approved: {
    title: "Business Application Approved",
    badge: "Status Notification",
    variables: [
      "recipientName",
      "businessName",
      "accountEmail",
      "accountId",
      "planType",
      "approvedDate",
      "actionUrl",
    ],
  },
  business_rejected: {
    title: "Business Application Update",
    badge: "Status Notification",
    variables: ["recipientName", "businessName", "reason", "actionUrl"],
  },
};

// Brand primary color for HTML email button styling (mail clients require standard hex colors)
const DEFAULT_BRAND_PRIMARY_HEX = "#0B9086";

const EmailTemplatesSection = () => {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [activeLangs, setActiveLangs] = useState({});
  const [openBrandingIds, setOpenBrandingIds] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [copiedVar, setCopiedVar] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    tpl: null,
    lang: "en",
  });
  const [buttonModal, setButtonModal] = useState({
    open: false,
    tplId: null,
    label: "",
    url: "",
    color: DEFAULT_BRAND_PRIMARY_HEX,
  });

  useEffect(() => {
    let mounted = true;
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const data = await getEmailTemplates();
        if (mounted) {
          const list = Array.isArray(data) ? data : [];
          setTemplates(list);

          const initialForm = {};
          const initialLangs = {};

          list.forEach((tpl) => {
            const meta = tpl.metadata || {};
            const id = tpl._id || tpl.id;
            initialForm[id] = {
              subjectInEnglish: tpl.subjectInEnglish || "",
              bodyInEnglish:
                tpl.bodyInEnglish || tpl.descriptionInEnglish || "",
              subjectInArabic: tpl.subjectInArabic || "",
              bodyInArabic: tpl.bodyInArabic || tpl.descriptionInArabic || "",
              status: tpl.status || "active",
              metadata: {
                titleInEnglish: meta.titleInEnglish || "",
                titleInArabic: meta.titleInArabic || "",
                buttonLabelInEnglish: meta.buttonLabelInEnglish || "",
                buttonLabelInArabic: meta.buttonLabelInArabic || "",
                cardTitleInEnglish: meta.cardTitleInEnglish || "",
                cardTitleInArabic: meta.cardTitleInArabic || "",
                subtextInEnglish: meta.subtextInEnglish || "",
                subtextInArabic: meta.subtextInArabic || "",
                logoUrl: meta.logoUrl || "",
                supportEmail: meta.supportEmail || "support@clothsync.com",
                locationInEnglish:
                  meta.locationInEnglish || "Riyadh, Saudi Arabia",
                locationInArabic:
                  meta.locationInArabic || "الرياض، المملكة العربية السعودية",
                taglineInEnglish:
                  meta.taglineInEnglish ||
                  "The complete platform for managing RFID linen & laundry operations with elegance and efficiency.",
                taglineInArabic:
                  meta.taglineInArabic ||
                  "المنصة المتكاملة لإدارة عمليات الكتان والغسيل باستخدام تقنية RFID بكل كفاءة وأناقة.",
                copyrightText:
                  meta.copyrightText ||
                  "© {year} ClothSync Systems. All rights reserved.",
              },
            };
            initialLangs[id] = "en";
          });

          setFormData(initialForm);
          setInitialData(JSON.parse(JSON.stringify(initialForm)));
          setActiveLangs(initialLangs);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to load email templates:", err);
          toast.error("Failed to load email templates from server.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTemplates();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleBranding = (id) => {
    setOpenBrandingIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLangChange = (id, lang) => {
    setActiveLangs((prev) => ({
      ...prev,
      [id]: lang,
    }));
  };

  const handleFieldChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleMetaChange = (id, metaKey, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        metadata: {
          ...(prev[id]?.metadata || {}),
          [metaKey]: value,
        },
      },
    }));
  };

  const hasChanges = (id) => {
    const current = formData[id];
    const original = initialData[id];
    if (!current || !original) return false;
    return (
      current.subjectInEnglish !== original.subjectInEnglish ||
      current.bodyInEnglish !== original.bodyInEnglish ||
      current.subjectInArabic !== original.subjectInArabic ||
      current.bodyInArabic !== original.bodyInArabic ||
      current.status !== original.status ||
      JSON.stringify(current.metadata) !== JSON.stringify(original.metadata)
    );
  };

  const handleCopyVar = (variable) => {
    const text = `{{${variable}}}`;
    navigator.clipboard.writeText(text);
    setCopiedVar(text);
    toast.success(`Copied ${text} — paste it into subject or body!`);
    setTimeout(() => setCopiedVar(null), 2500);
  };

  const handleInsertVar = (id, variable) => {
    const tag = `{{${variable}}}`;
    const lang = activeLangs[id] || "en";
    const bodyField = lang === "ar" ? "bodyInArabic" : "bodyInEnglish";
    const currentBody = formData[id]?.[bodyField] || "";

    const updated = currentBody ? `${currentBody} ${tag}` : `<p>${tag}</p>`;
    handleFieldChange(id, bodyField, updated);
    toast.success(
      `Inserted ${tag} into ${lang === "ar" ? "Arabic" : "English"} email body`,
    );
  };

  const openButtonModal = (tplId) => {
    const tpl = templates.find((t) => (t._id || t.id) === tplId);
    const lang = activeLangs[tplId] || "en";
    let defaultLabel =
      lang === "ar" ? "تأكيد الحساب والبدء" : "Verify Account & Set Password";
    let defaultUrl = "{{verificationUrl}}";

    if (tpl?.key?.includes("laundry_invitation")) {
      defaultLabel =
        lang === "ar" ? "قبول دعوة الشراكة" : "Accept Partnership Invitation";
      defaultUrl = "{{inviteUrl}}";
    } else if (
      tpl?.key?.includes("approval") ||
      tpl?.key?.includes("approved")
    ) {
      defaultLabel = lang === "ar" ? "مراجعة التفاصيل" : "Review Details";
      defaultUrl = "{{actionUrl}}";
    }

    setButtonModal({
      open: true,
      tplId,
      label: defaultLabel,
      url: defaultUrl,
      color: DEFAULT_BRAND_PRIMARY_HEX,
    });
  };

  const handleInsertButton = () => {
    if (!buttonModal.label.trim()) {
      toast.error("Please enter a button label");
      return;
    }
    if (!buttonModal.url.trim()) {
      toast.error("Please enter a button URL or variable tag");
      return;
    }

    const tplId = buttonModal.tplId;
    const lang = activeLangs[tplId] || "en";
    const bodyField = lang === "ar" ? "bodyInArabic" : "bodyInEnglish";
    const currentBody = formData[tplId]?.[bodyField] || "";

    const buttonHtml = `<p><a href="${buttonModal.url}" target="_blank" style="display:inline-block;padding:12px 24px;background:${buttonModal.color};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;margin:12px 0;">${buttonModal.label}</a></p>`;

    const updated = currentBody ? `${currentBody} ${buttonHtml}` : buttonHtml;
    handleFieldChange(tplId, bodyField, updated);

    toast.success(
      `Inserted CTA Button into ${lang === "ar" ? "Arabic" : "English"} email body!`,
    );
    setButtonModal({
      open: false,
      tplId: null,
      label: "",
      url: "",
      color: DEFAULT_BRAND_PRIMARY_HEX,
    });
  };

  const handleSave = async (tpl) => {
    const tplId = tpl._id || tpl.id;
    const current = formData[tplId];
    if (!current) return;

    if (!current.subjectInEnglish?.trim()) {
      toast.error("English subject line is required.");
      return;
    }
    if (!current.bodyInEnglish?.trim()) {
      toast.error("English body content is required.");
      return;
    }

    setSavingId(tplId);
    try {
      const payload = {
        subjectInEnglish: current.subjectInEnglish,
        bodyInEnglish: current.bodyInEnglish,
        subjectInArabic: current.subjectInArabic || "",
        bodyInArabic: current.bodyInArabic || "",
        status: current.status || "active",
        metadata: current.metadata || {},
      };

      const res = await updateEmailTemplate(tplId, payload);
      if (
        res?.status === 200 ||
        res?.success ||
        res?.message ||
        res?.statusCode === 201
      ) {
        setInitialData((prev) => ({
          ...prev,
          [tplId]: JSON.parse(JSON.stringify(current)),
        }));
        setTemplates((prev) =>
          prev.map((item) =>
            (item._id || item.id) === tplId
              ? { ...item, ...payload, updatedAt: new Date().toISOString() }
              : item,
          ),
        );
        toast.success(`Template "${tpl.key}" updated successfully!`);
      } else {
        toast.error("Failed to update email template.");
      }
    } catch (err) {
      console.error("Save template error:", err);
      toast.error("Failed to save email template.");
    } finally {
      setSavingId(null);
    }
  };

  const openPreview = (tpl, lang) => {
    setPreviewModal({
      open: true,
      tpl,
      lang: lang || activeLangs[tpl._id || tpl.id] || "en",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-(--theme-text-primary) md:text-3xl">
            Email Templates
          </h1>
          <p className="mt-1 text-sm text-(--theme-text-muted)">
            Customize all email content: Subject, Main Heading, Body Message,
            Action Buttons, Details Card, and Branding Footer.
          </p>
        </div>
      </div>

      {/* Templates Accordion List */}
      {isLoading ? (
        <Card className="flex min-h-80 items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--color-aurora-teal) border-t-transparent" />
            <span className="text-sm font-medium text-(--theme-text-secondary)">
              Loading email templates from system...
            </span>
          </div>
        </Card>
      ) : templates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle size={40} className="text-(--color-pending) mb-3" />
          <h3 className="text-base font-bold text-(--theme-text-primary)">
            No Email Templates Found
          </h3>
          <p className="mt-1 text-sm text-(--theme-text-secondary)">
            System templates have not been seeded or configured on the backend.
          </p>
        </Card>
      ) : (
        <Accordion>
          {templates.map((tpl) => {
            const tplId = tpl._id || tpl.id;
            const meta = TEMPLATE_META[tpl.key] || {
              title: tpl.name || tpl.key.replace(/_/g, " "),
              badge: "General",
              variables: [],
            };

            const variables =
              Array.isArray(tpl.availableVariables) &&
              tpl.availableVariables.length > 0
                ? tpl.availableVariables
                : meta.variables || [];

            const current = formData[tplId] || {};
            const curMeta = current.metadata || {};
            const lang = activeLangs[tplId] || "en";
            const isUnsaved = hasChanges(tplId);
            const isSaving = savingId === tplId;
            const isBrandingOpen = !!openBrandingIds[tplId];

            const formattedDate = tpl.updatedAt
              ? new Date(tpl.updatedAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Never";

            return (
              <AccordionItem
                key={tplId}
                id={tplId}
                title={
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-(--theme-text-primary)">
                      {meta.title}
                    </span>
                    <Badge variant="subtle" size="xs">
                      {meta.badge}
                    </Badge>
                    {current.status === "active" ? (
                      <Badge variant="success" size="xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="xs">
                        Inactive
                      </Badge>
                    )}
                    {isUnsaved && (
                      <Badge variant="warning" size="xs">
                        Unsaved
                      </Badge>
                    )}
                  </div>
                }
                subtitle={
                  <div className="flex flex-wrap items-center gap-2 text-xs text-(--theme-text-muted)">
                    <span className="font-mono text-[11px] text-(--theme-text-secondary)">
                      {tpl.key}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-(--color-aurora-teal)">
                      <Code2 size={12} />
                      {variables.length} Dynamic Variables
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Updated: {formattedDate}
                    </span>
                  </div>
                }
              >
                {/* Controls Row: Status Toggle + Language Switcher + Live Preview Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-(--theme-border) pb-4">
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={current.status === "active"}
                      onChange={(active) =>
                        handleFieldChange(
                          tplId,
                          "status",
                          active ? "active" : "inactive",
                        )
                      }
                      size="md"
                    />
                    <div>
                      <span className="text-sm font-bold text-(--theme-text-primary)">
                        Template Status:{" "}
                        {current.status === "active" ? (
                          <span className="text-(--color-ready)">Active</span>
                        ) : (
                          <span className="text-(--theme-text-muted)">
                            Inactive (Paused)
                          </span>
                        )}
                      </span>
                      <p className="text-xs text-(--theme-text-muted)">
                        {current.status === "active"
                          ? "Emails are actively sent to recipients by this trigger"
                          : "Automated delivery is temporarily suppressed"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye size={15} />}
                      onClick={() => openPreview(tpl, lang)}
                      type="button"
                    >
                      Preview Email
                    </Button>

                    <Tabs
                      equalWidth={false}
                      items={[
                        {
                          value: "en",
                          label: "English (LTR)",
                          icon: <Languages size={15} />,
                        },
                        {
                          value: "ar",
                          label: "العربية (RTL)",
                          icon: <Globe size={15} />,
                        },
                      ]}
                      value={lang}
                      onChange={(nextLang) => handleLangChange(tplId, nextLang)}
                    />
                  </div>
                </div>

                {/* Dynamic Variables Bar */}
                {variables.length > 0 && (
                  <div className="rounded-2xl border border-(--theme-border) bg-(--theme-surface-strong)/60 p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          size={15}
                          className="text-(--color-aurora-teal)"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-(--theme-text-primary)">
                          Available Dynamic Variables ({variables.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-(--theme-text-muted)">
                        Click any variable to copy or insert into body
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {variables.map((v) => {
                        const placeholder = `{{${v}}}`;
                        const isCopied = copiedVar === placeholder;
                        const desc =
                          VARIABLE_DEFINITIONS[v] || "Template variable";
                        return (
                          <div
                            key={v}
                            className="group flex items-center justify-between rounded-xl border border-(--theme-border) bg-(--theme-surface) p-2 transition-all hover:border-(--color-aurora-teal) hover:shadow-xs"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-mono text-xs font-bold text-(--color-aurora-teal) truncate">
                                {placeholder}
                              </span>
                              <span className="text-[11px] text-(--theme-text-muted) truncate">
                                {desc}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopyVar(v)}
                                title="Copy variable tag"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--theme-surface-strong) text-(--theme-text-secondary) hover:text-(--color-aurora-teal) transition-colors"
                              >
                                {isCopied ? (
                                  <Check
                                    size={13}
                                    className="text-(--color-ready)"
                                  />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInsertVar(tplId, v)}
                                title="Insert variable into body"
                                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-(--color-aurora-teal)/10 text-(--color-aurora-teal) hover:bg-(--color-aurora-teal) hover:text-(--theme-surface-solid) transition-all"
                              >
                                + Insert
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section 1: Subject & Email Header Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lang === "en" ? (
                    <>
                      <Input
                        label="Email Subject Line (English)"
                        value={current.subjectInEnglish || ""}
                        onChange={(val) =>
                          handleFieldChange(tplId, "subjectInEnglish", val)
                        }
                        placeholder="e.g. Partnership invitation from {{tenantName}} - ClothSync"
                        leftIcon={<Mail size={16} />}
                        required
                      />
                      <Input
                        label="Email Main Header Title (English)"
                        value={curMeta.titleInEnglish || ""}
                        onChange={(val) =>
                          handleMetaChange(tplId, "titleInEnglish", val)
                        }
                        placeholder="e.g. Laundry Partnership Invitation"
                        leftIcon={<Sparkles size={16} />}
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        dir="rtl"
                        label="موضوع البريد الإلكتروني (بالعربية)"
                        value={current.subjectInArabic || ""}
                        onChange={(val) =>
                          handleFieldChange(tplId, "subjectInArabic", val)
                        }
                        placeholder="مثال: دعوة شراكة من {{tenantName}} - ClothSync"
                        leftIcon={<Mail size={16} />}
                        inputClassName="text-right"
                      />
                      <Input
                        dir="rtl"
                        label="عنوان الرسالة الرئيسي العلوي (بالعربية)"
                        value={curMeta.titleInArabic || ""}
                        onChange={(val) =>
                          handleMetaChange(tplId, "titleInArabic", val)
                        }
                        placeholder="مثال: دعوة شراكة المغسلة"
                        leftIcon={<Sparkles size={16} />}
                        inputClassName="text-right"
                      />
                    </>
                  )}
                </div>

                {/* Section 2: Body Content (Quill Editor) */}
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <label className="block text-sm font-semibold text-(--theme-text-secondary)">
                        {lang === "en"
                          ? "Email Body Content (English HTML)"
                          : "محتوى نص البريد الإلكتروني (بالعربية)"}
                        <span className="ml-1 text-(--color-overdue)">*</span>
                      </label>
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<MousePointerClick size={13} />}
                        onClick={() => openButtonModal(tplId)}
                        type="button"
                      >
                        + Insert CTA Button
                      </Button>
                    </div>
                    <span className="text-xs text-(--theme-text-muted)">
                      Dynamic tags like{" "}
                      <code className="font-mono text-(--color-aurora-teal)">
                        {"{{tenantName}}"}
                      </code>{" "}
                      will be replaced automatically upon dispatch.
                    </span>
                  </div>
                  <QuillEditor
                    key={`${lang}-${tplId}`}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    value={
                      lang === "ar"
                        ? current.bodyInArabic || ""
                        : current.bodyInEnglish || ""
                    }
                    onChange={(val) =>
                      handleFieldChange(
                        tplId,
                        lang === "ar" ? "bodyInArabic" : "bodyInEnglish",
                        val,
                      )
                    }
                    onInsertCta={() => openButtonModal(tplId)}
                    placeholder={
                      lang === "ar"
                        ? "اكتب نص الرسالة البريدية بالعربية..."
                        : "Draft your English email copy here..."
                    }
                    minHeight="240px"
                  />
                </div>

                {/* Section 3: Button, Card Title & Notice Customization */}
                <div className="rounded-2xl border border-(--theme-border) bg-(--theme-surface-strong)/40 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings2
                      size={16}
                      className="text-(--color-aurora-teal)"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-(--theme-text-primary)">
                      Card & CTA Button Customization
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lang === "en" ? (
                      <>
                        <Input
                          label="CTA Button Text"
                          value={curMeta.buttonLabelInEnglish || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "buttonLabelInEnglish", val)
                          }
                          placeholder="e.g. Accept Invitation"
                        />
                        <Input
                          label="Details Card Title"
                          value={curMeta.cardTitleInEnglish || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "cardTitleInEnglish", val)
                          }
                          placeholder="e.g. INVITATION DETAILS"
                        />
                        <Input
                          label="Notice / Expiration Sub-text"
                          value={curMeta.subtextInEnglish || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "subtextInEnglish", val)
                          }
                          placeholder="e.g. This invitation link may expire. Please accept promptly."
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          dir="rtl"
                          label="نص زر الإجراء (CTA Button)"
                          value={curMeta.buttonLabelInArabic || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "buttonLabelInArabic", val)
                          }
                          placeholder="مثال: قبول الدعوة"
                          inputClassName="text-right"
                        />
                        <Input
                          dir="rtl"
                          label="عنوان بطاقة التفاصيل"
                          value={curMeta.cardTitleInArabic || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "cardTitleInArabic", val)
                          }
                          placeholder="مثال: تفاصيل الدعوة"
                          inputClassName="text-right"
                        />
                        <Input
                          dir="rtl"
                          label="ملاحظة التنبيه والصلاحية"
                          value={curMeta.subtextInArabic || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "subtextInArabic", val)
                          }
                          placeholder="مثال: قد تنتهي صلاحية رابط الدعوة هذا. يرجى القبول في أقرب وقت."
                          inputClassName="text-right"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Section 4: Email Branding & Footer (Collapsible) */}
                <div className="rounded-2xl border border-(--theme-border) bg-(--theme-surface-strong)/20 p-4">
                  <button
                    type="button"
                    onClick={() => toggleBranding(tplId)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon
                        size={16}
                        className="text-(--color-aurora-teal)"
                      />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-(--theme-text-primary)">
                          Email Branding & Footer Settings
                        </span>
                        <p className="text-[11px] text-(--theme-text-muted)">
                          Set custom Logo URL, Support Email, Location, Tagline,
                          and Copyright for this template
                        </p>
                      </div>
                    </div>
                    <div className="text-(--theme-text-secondary)">
                      {isBrandingOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </button>

                  {isBrandingOpen && (
                    <div className="mt-4 pt-4 border-t border-(--theme-border) space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Custom Header & Footer Logo URL"
                          value={curMeta.logoUrl || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "logoUrl", val)
                          }
                          placeholder="https://your-domain.com/logo.png (leave blank for default logo)"
                          leftIcon={<ImageIcon size={16} />}
                        />
                        <Input
                          label="Support Contact Email"
                          value={curMeta.supportEmail || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "supportEmail", val)
                          }
                          placeholder="e.g. support@clothsync.com"
                          leftIcon={<Mail size={16} />}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Office Location / City"
                          value={
                            lang === "ar"
                              ? curMeta.locationInArabic || ""
                              : curMeta.locationInEnglish || ""
                          }
                          onChange={(val) =>
                            handleMetaChange(
                              tplId,
                              lang === "ar"
                                ? "locationInArabic"
                                : "locationInEnglish",
                              val,
                            )
                          }
                          placeholder={
                            lang === "ar"
                              ? "الرياض، المملكة العربية السعودية"
                              : "e.g. Riyadh, Saudi Arabia"
                          }
                          leftIcon={<MapPin size={16} />}
                          dir={lang === "ar" ? "rtl" : "ltr"}
                        />
                        <Input
                          label="Copyright Notice"
                          value={curMeta.copyrightText || ""}
                          onChange={(val) =>
                            handleMetaChange(tplId, "copyrightText", val)
                          }
                          placeholder="e.g. © {year} ClothSync Systems. All rights reserved."
                        />
                      </div>

                      <div>
                        <Input
                          label="Footer Brand Tagline"
                          value={
                            lang === "ar"
                              ? curMeta.taglineInArabic || ""
                              : curMeta.taglineInEnglish || ""
                          }
                          onChange={(val) =>
                            handleMetaChange(
                              tplId,
                              lang === "ar"
                                ? "taglineInArabic"
                                : "taglineInEnglish",
                              val,
                            )
                          }
                          placeholder="e.g. The complete platform for managing RFID linen & laundry operations..."
                          dir={lang === "ar" ? "rtl" : "ltr"}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Save Action Footer */}
                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between border-t border-(--theme-border)">
                  <div className="flex items-center gap-2 text-xs text-(--theme-text-muted)">
                    <CheckCircle2
                      size={14}
                      className="text-(--color-aurora-teal)"
                    />
                    <span>
                      Templates are sanitized and rendered responsively across
                      all modern mail clients.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      leftIcon={<Eye size={16} />}
                      onClick={() => openPreview(tpl, lang)}
                      type="button"
                    >
                      Preview
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      leftIcon={<Save size={16} />}
                      onClick={() => handleSave(tpl)}
                      loading={isSaving}
                      disabled={isSaving || !isUnsaved}
                      type="button"
                    >
                      {isUnsaved ? "Save Changes" : "Saved"}
                    </Button>
                  </div>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Insert Action Button Modal */}
      <Modal
        open={buttonModal.open}
        onClose={() =>
          setButtonModal({
            open: false,
            tplId: null,
            label: "",
            url: "",
            color: DEFAULT_BRAND_PRIMARY_HEX,
          })
        }
        title="Insert Call-to-Action (CTA) Button"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Button Label"
            value={buttonModal.label}
            onChange={(val) =>
              setButtonModal((prev) => ({ ...prev, label: val }))
            }
            placeholder="e.g. Accept Invitation, Verify Account"
            required
          />

          <Input
            label="Target URL or Variable"
            value={buttonModal.url}
            onChange={(val) =>
              setButtonModal((prev) => ({ ...prev, url: val }))
            }
            placeholder="e.g. {{inviteUrl}} or https://your-portal.com/login"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-(--theme-text-secondary) mb-1.5">
              Button Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={buttonModal.color}
                onChange={(e) =>
                  setButtonModal((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                className="h-9 w-12 cursor-pointer rounded-lg border border-(--theme-border) bg-transparent p-1"
              />
              <span className="font-mono text-xs font-bold text-(--theme-text-primary)">
                {buttonModal.color}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-(--theme-border)">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setButtonModal({
                  open: false,
                  tplId: null,
                  label: "",
                  url: "",
                  color: DEFAULT_BRAND_PRIMARY_HEX,
                })
              }
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInsertButton}
              type="button"
            >
              Insert into Body
            </Button>
          </div>
        </div>
      </Modal>

      {/* Live Email Preview Modal */}
      {previewModal.open && previewModal.tpl && (
        <Modal
          open={previewModal.open}
          onClose={() =>
            setPreviewModal({ open: false, tpl: null, lang: "en" })
          }
          title={`Live Email Preview - ${TEMPLATE_META[previewModal.tpl.key]?.title || previewModal.tpl.key}`}
          size="lg"
        >
          {(() => {
            const tpl = previewModal.tpl;
            const tplId = tpl._id || tpl.id;
            const form = formData[tplId] || {};
            const meta = form.metadata || {};
            const isAr = previewModal.lang === "ar";

            const subject =
              (isAr ? form.subjectInArabic : form.subjectInEnglish) ||
              "Email Notification";
            const title =
              (isAr ? meta.titleInArabic : meta.titleInEnglish) || subject;
            const body =
              (isAr ? form.bodyInArabic : form.bodyInEnglish) ||
              "<p>Email message body...</p>";
            const buttonLabel =
              (isAr ? meta.buttonLabelInArabic : meta.buttonLabelInEnglish) ||
              "Action Button";
            const cardTitle =
              (isAr ? meta.cardTitleInArabic : meta.cardTitleInEnglish) ||
              "DETAILS";
            const subtext =
              (isAr ? meta.subtextInArabic : meta.subtextInEnglish) || "";
            const logoUrl = meta.logoUrl || "/logo.png";
            const supportEmail = meta.supportEmail || "support@clothsync.com";
            const location =
              (isAr ? meta.locationInArabic : meta.locationInEnglish) ||
              "Riyadh, Saudi Arabia";
            const tagline =
              (isAr ? meta.taglineInArabic : meta.taglineInEnglish) ||
              "The complete platform for managing RFID linen & laundry operations with elegance and efficiency.";
            const copyright = (
              meta.copyrightText ||
              "© {year} ClothSync Systems. All rights reserved."
            ).replace("{year}", new Date().getFullYear());

            return (
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                {/* Subject Preview Bar */}
                <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface-strong)/50 p-3 flex items-center gap-2">
                  <Mail
                    size={16}
                    className="text-(--color-aurora-teal) shrink-0"
                  />
                  <span className="text-xs text-(--theme-text-muted) font-semibold shrink-0">
                    Subject:
                  </span>
                  <span className="text-xs font-bold text-(--theme-text-primary) truncate">
                    {subject}
                  </span>
                </div>

                {/* Email Mock Container */}
                <div
                  className="rounded-2xl border border-(--theme-border) bg-(--theme-bg-soft) p-4 sm:p-6"
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <div className="max-w-140 mx-auto space-y-4">
                    {/* Main Email Card */}
                    <div className="rounded-2xl border border-(--theme-border) bg-(--theme-surface-solid) p-6 sm:p-8 shadow-sm">
                      {/* Logo */}
                      <div className="text-center mb-5">
                        <img
                          src={logoUrl}
                          alt="Brand Logo"
                          className="h-10 mx-auto object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/logo.png";
                          }}
                        />
                      </div>

                      {/* Header Title */}
                      <h2 className="text-xl font-bold text-(--theme-text-primary) text-center mb-4 leading-snug">
                        {title}
                      </h2>

                      {/* Message Body */}
                      <div
                        className="text-sm text-(--theme-text-secondary) leading-relaxed mb-6 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: body }}
                      />

                      {/* Details Card (Sample) */}
                      <div className="rounded-xl border border-(--theme-border) bg-(--theme-bg) p-4 mb-6">
                        <div className="text-[11px] font-extrabold tracking-wider uppercase text-(--theme-text-secondary) pb-2 border-b border-(--theme-border-soft) mb-2">
                          {cardTitle}
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1 border-b border-(--theme-border-soft)">
                            <span className="text-(--theme-text-secondary)">Email</span>
                            <span className="font-bold text-(--theme-text-primary)">
                              user@example.com
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-(--theme-text-secondary)">Status</span>
                            <span className="font-bold text-(--color-pending)">
                              Pending Acceptance
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      {buttonLabel && (
                        <div className="text-center my-6">
                          <span className="inline-block px-7 py-3 rounded-lg font-bold text-(--theme-surface-solid) text-sm bg-(--color-aurora-teal) shadow-sm">
                            {buttonLabel}
                          </span>
                        </div>
                      )}

                      {/* Subtext */}
                      {subtext && (
                        <p className="text-xs text-center text-(--theme-text-muted) leading-relaxed mt-4">
                          {subtext}
                        </p>
                      )}
                    </div>

                    {/* Footer Card */}
                    <div className="rounded-2xl border border-(--theme-border) bg-(--theme-bg) p-5 text-center text-xs text-(--theme-text-secondary) space-y-3">
                      <img
                        src={logoUrl}
                        alt="Brand Footer"
                        className="h-6 mx-auto object-contain opacity-80"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/logo.png";
                        }}
                      />
                      <p className="text-[11px] leading-relaxed max-w-md mx-auto">
                        {tagline}
                      </p>
                      <div className="flex justify-center items-center gap-2 text-[11px] font-medium text-(--theme-text-secondary)">
                        <span>✉ {supportEmail}</span>
                        <span>•</span>
                        <span>📍 {location}</span>
                      </div>
                      <p className="text-[10px] text-(--theme-text-muted) pt-1 border-t border-(--theme-border-soft)">
                        {copyright}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

export default EmailTemplatesSection;
