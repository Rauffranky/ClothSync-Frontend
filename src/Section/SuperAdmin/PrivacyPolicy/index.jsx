import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Save,
  ExternalLink,
  Clock,
  CheckCircle2,
  Sparkles,
  Languages,
  Globe,
} from "lucide-react";
import { toast } from "../../../Utils/toast";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import Badge from "../../../Components/UI/Badge";
import Tabs from "../../../Components/UI/Tabs";
import QuillEditor from "../../../Components/UI/QuillEditor";
import {
  getPrivacyPolicy,
  savePrivacyPolicy,
} from "../../../axios/system/privacyPolicy";

const PrivacyPolicySection = () => {
  const [contentEn, setContentEn] = useState("");
  const [contentAr, setContentAr] = useState("");
  const [initialContentEn, setInitialContentEn] = useState("");
  const [initialContentAr, setInitialContentAr] = useState("");
  const [activeLang, setActiveLang] = useState("en");
  const [updatedAt, setUpdatedAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchPolicy = async () => {
      setIsLoading(true);
      try {
        const data = await getPrivacyPolicy();
        if (mounted) {
          const en = data.contentEn || data.content || "";
          const ar = data.contentAr || "";
          setContentEn(en);
          setInitialContentEn(en);
          setContentAr(ar);
          setInitialContentAr(ar);
          setUpdatedAt(data.updatedAt || "");
        }
      } catch {
        if (mounted) {
          toast.error("Failed to load privacy policy");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPolicy();
    return () => {
      mounted = false;
    };
  }, []);

  const hasUnsavedChanges =
    contentEn !== initialContentEn || contentAr !== initialContentAr;

  const currentContent = activeLang === "ar" ? contentAr : contentEn;

  const handleContentChange = (val) => {
    if (activeLang === "ar") {
      setContentAr(val);
    } else {
      setContentEn(val);
    }
  };

  const handleSave = async () => {
    if (!contentEn.trim() || contentEn === "<p><br></p>") {
      toast.error("English privacy policy cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await savePrivacyPolicy({
        contentEn,
        contentAr,
      });
      if (result.success) {
        setInitialContentEn(contentEn);
        setInitialContentAr(contentAr);
        setUpdatedAt(result.updatedAt);
        toast.success(
          "Privacy Policy published successfully! Live on landing page.",
        );
      } else {
        toast.error("Failed to save privacy policy.");
      }
    } catch {
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const textOnly = currentContent
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = textOnly ? textOnly.split(" ").length : 0;
  const charCount = textOnly ? textOnly.length : 0;

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-(--theme-text-primary) md:text-3xl">
              Privacy Policy
            </h1>
            <Badge
              variant="success"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Live on Landing
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button
              variant="outline"
              size="md"
              leftIcon={<ExternalLink size={16} />}
              type="button"
            >
              Preview on Landing
            </Button>
          </a>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
            loading={isSaving}
            disabled={isLoading || isSaving || !hasUnsavedChanges}
            type="button"
          >
            {hasUnsavedChanges ? "Save & Publish" : "Published"}
          </Button>
        </div>
      </div>

      {/* Info Status Card */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-(--theme-text-primary)">
                  Public Landing Status: Active
                </span>
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Unsaved Changes
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-(--theme-text-muted) sm:border-l sm:border-(--theme-border) sm:pl-5">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-(--theme-text-muted)" />
              <span>Last updated: {formattedDate}</span>
            </div>
            <div className="hidden items-center gap-1.5 md:flex">
              <Sparkles size={14} className="text-(--color-aurora-teal)" />
              <span>
                {wordCount} words ({charCount} chars)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Rich Text Editor Card */}
      <Card className="overflow-hidden p-6 sm:p-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-(--theme-border) pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-(--color-aurora-teal)" />
            <span className="text-sm font-bold text-(--theme-text-primary)">
              Quill Document Editor
            </span>
          </div>

          {/* Language Selector */}
          <div className="w-full sm:w-auto">
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
              value={activeLang}
              onChange={setActiveLang}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-87.5 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--color-aurora-teal) border-t-transparent" />
              <span className="text-sm font-medium text-(--theme-text-secondary)">
                Loading privacy policy content...
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <QuillEditor
              key={activeLang}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
              value={currentContent}
              onChange={handleContentChange}
              placeholder={
                activeLang === "ar"
                  ? "ابدأ بصياغة سياسة الخصوصية باللغة العربية هنا..."
                  : "Start drafting your privacy policy in English here..."
              }
              minHeight="420px"
            />
            <div className="flex items-center justify-between pt-2 text-xs font-medium text-(--theme-text-muted)">
              <span>
                {activeLang === "ar"
                  ? "تنسيق متقدم مدعوم باتجاه اليمين لليسار (عناوين، نص عريض، قوائم، روابط)"
                  : "Rich formatting supported (Headings, bold, italic, colors, bullet points, numbered lists, links)"}
              </span>
              <span>{wordCount} words</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PrivacyPolicySection;
