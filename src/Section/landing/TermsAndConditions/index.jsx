import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  ShieldCheck,
  Mail,
  HelpCircle,
} from "lucide-react";
import { getTermsAndConditions } from "../../../axios/system/termsAndConditions";
import Card from "../../../Components/UI/Card";

const TermsAndConditionsSection = () => {
  const [contentEn, setContentEn] = useState("");
  const [contentAr, setContentAr] = useState("");
  const activeLang = "en";
  const [updatedAt, setUpdatedAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchTerms = async () => {
      try {
        const data = await getTermsAndConditions();
        if (mounted) {
          setContentEn(data.contentEn || data.content || "");
          setContentAr(data.contentAr || "");
          setUpdatedAt(data.updatedAt || "");
        }
      } catch (error) {
        console.error("Failed to load Terms and Conditions", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchTerms();
    return () => {
      mounted = false;
    };
  }, []);

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "September 10, 2026";

  const currentContent =
    activeLang === "ar"
      ? contentAr || contentEn
      : contentEn || contentAr;

  return (
    <div className="space-y-4 pb-8 md:space-y-6 md:pb-14">
      {/* Header Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        <Card padding="28px 32px" rounded="20px">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold"
                style={{
                  color: "var(--color-aurora-teal)",
                  background: "rgba(20, 184, 166, 0.1)",
                  borderColor: "rgba(20, 184, 166, 0.22)",
                }}
              >
                <ShieldCheck size={15} />
                Official Platform Terms
              </div>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-(--theme-text-primary) sm:text-4xl md:text-5xl">
              {activeLang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
            </h1>

            <p className="mt-3 text-base font-medium leading-relaxed text-(--theme-text-secondary) md:text-lg">
              {activeLang === "ar"
                ? "يرجى مراجعة الشروط القياسية، وبروتوكولات مسح أجهزة RFID، وسياسات الاستخدام لمنصة كلوث سينك لإدارة المغاسل."
                : "Please review the standard terms, hardware scanning protocols, and platform usage policies for the ClothSync RFID Laundry Management System."}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-(--theme-text-muted)">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-(--color-aurora-teal)" />
                {activeLang === "ar"
                  ? `ساري اعتباراً من: ${formattedDate}`
                  : `Effective as of: ${formattedDate}`}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-(--theme-border)" />
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-(--color-aurora-teal)" />
                {activeLang === "ar" ? "اتفاقية ملزمة قانوناً" : "Legally Binding Agreement"}
              </span>
            </div>
          </div>
        </Card>

        <Card padding="24px" rounded="20px" className="flex flex-col justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
              <HelpCircle size={20} />
            </div>
            <h3 className="mt-4 text-base font-bold text-(--theme-text-primary)">
              {activeLang === "ar" ? "هل لديك استفسارات؟" : "Have questions?"}
            </h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-(--theme-text-secondary)">
              {activeLang === "ar"
                ? "إذا كانت لديك أي أسئلة بخصوص هذه الشروط أو اتفاقيات مستوى الخدمة، فإن فريق الدعم متوفر على مدار الساعة."
                : "If you have any questions regarding these terms, SLA guarantees, or compliance requirements, our support team is available 24/7."}
            </p>
          </div>
          <a
            href="mailto:support@clothsync.com"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-(--color-aurora-teal) hover:underline"
          >
            <Mail size={14} />
            support@clothsync.com
          </a>
        </Card>
      </div>

      {/* Document Body */}
      <Card padding="28px 32px" rounded="20px">
        {isLoading ? (
          <div className="space-y-6 py-8">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-(--theme-surface-hover)" />
            <div className="h-4 w-full animate-pulse rounded bg-(--theme-surface-hover)" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-(--theme-surface-hover)" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-(--theme-surface-hover)" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-(--theme-surface-hover)" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-(--theme-surface-hover)" />
            <div className="h-4 w-full animate-pulse rounded bg-(--theme-surface-hover)" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-(--theme-surface-hover)" />
          </div>
        ) : (
          <div
            dir={activeLang === "ar" ? "rtl" : "ltr"}
            className={`terms-rendered-content prose prose-teal max-w-none text-(--theme-text-secondary) ${
              activeLang === "ar" ? "text-right" : "text-left"
            }`}
            dangerouslySetInnerHTML={{ __html: currentContent }}
          />
        )}
      </Card>
    </div>
  );
};

export default TermsAndConditionsSection;
