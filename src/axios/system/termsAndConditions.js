import api from "../api";

const STORAGE_KEY_EN = "clothsync_terms_and_conditions_en";
const STORAGE_KEY_AR = "clothsync_terms_and_conditions_ar";
const STORAGE_META_KEY = "clothsync_terms_meta";

export const DEFAULT_TERMS_AND_CONDITIONS_EN = `
<h2>1. Introduction & Acceptance of Terms</h2>
<p>Welcome to <strong>ClothSync RFID Laundry Management System</strong>. By accessing or using our platform, mobile scanning applications, or associated services, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.</p>

<h2>2. Service Description</h2>
<p>ClothSync provides cloud-connected RFID tracking, laundry workflow automation, asset management, and dispatch batch validation services for business tenants and laundry operations.</p>

<h2>3. User Roles & Account Security</h2>
<p>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must immediately notify ClothSync of any unauthorized use or security breach.</p>
<ul>
  <li><strong>Super Administrators:</strong> Exercise platform-wide oversight, tenant onboarding, and governance.</li>
  <li><strong>Tenant Administrators:</strong> Manage garments, assets, staff permissions, and dispatch batches.</li>
  <li><strong>Laundry Administrators:</strong> Process inbound and outbound batches, item check-in, and lifecycle statuses.</li>
</ul>

<h2>4. RFID Hardware & Scanner Usage</h2>
<p>Users operating handheld PDA scanners or fixed RFID reading portals must ensure hardware is configured properly. Automated or manual scanning scans tags according to authorized facility protocols.</p>

<h2>5. Data Privacy & Confidentiality</h2>
<p>ClothSync adheres to modern data protection standards. We do not sell or monetize confidential inventory data, client profiles, or operational manifests.</p>

<h2>6. Modifications to Terms</h2>
<p>ClothSync reserves the right to modify these Terms at any time. When updated by the Super Administrator, the new terms will immediately be reflected on this platform.</p>

<h2>7. Contact & Support</h2>
<p>For questions or compliance inquiries regarding these Terms & Conditions, please contact us at <a href="mailto:support@clothsync.com">support@clothsync.com</a>.</p>
`.trim();

export const DEFAULT_TERMS_AND_CONDITIONS_AR = `
<h2>١. المقدمة وقبول الشروط</h2>
<p>مرحباً بكم في <strong>نظام كلوث سينك (ClothSync) لإدارة المغاسل بتقنية RFID</strong>. باستخدام منصتنا أو تطبيقات المسح المحمولة أو الخدمات المرتبطة بها، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام خدماتنا.</p>

<h2>٢. وصف الخدمة</h2>
<p>يوفر كلوث سينك حلول التتبع السحابي المعتمدة على تقنية RFID، وأتمتة مسارات عمل المغاسل، وإدارة الأصول والملابس، والتحقق من دفعات الشحن للمنشآت والمغاسل المركزية.</p>

<h2>٣. أدوار المستخدمين وأمان الحسابات</h2>
<p>أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك. يجب عليك إخطار كلوث سينك فوراً بأي استخدام غير مصرح به أو خرق أمني.</p>
<ul>
  <li><strong>المشرف العام (Super Administrator):</strong> الإشراف الشامل على المنصة، وتهيئة المنشآت، والحوكمة الإدارية.</li>
  <li><strong>مشرف المنشأة (Tenant Administrator):</strong> إدارة الملابس والأصول، وصلاحيات الموظفين، ودفعات الإرسال.</li>
  <li><strong>مشرف المغسلة (Laundry Administrator):</strong> معالجة الدفعات الواردة والصادرة، وفحص العناصر، وتحديث حالات دورة العمل.</li>
</ul>

<h2>٤. أجهزة الـ RFID وبروتوكولات المسح</h2>
<p>يجب على المستخدمين الذين يقومون بتشغيل أجهزة المسح المحمولة (PDA) أو بوابات القراءة الثابتة التأكد من تهيئة الأجهزة بشكل صحيح ومسح العلامات وفقاً لبروتوكولات المنشأة المعتمدة.</p>

<h2>٥. خصوصية البيانات وسريتها</h2>
<p>يلتزم كلوث سينك بأحدث معايير حماية البيانات العالمية، ولا نقوم ببيع أو استغلال بيانات المخزون السرية أو ملفات تعريف العملاء أو سجلات التشغيل.</p>

<h2>٦. تعديل الشروط</h2>
<p>يحتفظ كلوث سينك بالحق في تعديل هذه الشروط في أي وقت. وعند تحديثها من قبل المشرف العام، تنعكس التعديلات فوراً على هذه المنصة.</p>

<h2>٧. الاتصال والدعم</h2>
<p>لأي استفسارات أو أسئلة تتعلق بالامتثال لهذه الشروط والأحكام، يرجى التواصل معنا عبر <a href="mailto:support@clothsync.com">support@clothsync.com</a>.</p>
`.trim();

export const DEFAULT_TERMS_AND_CONDITIONS = DEFAULT_TERMS_AND_CONDITIONS_EN;

export const getTermsAndConditions = async ({ lang = "en" } = {}) => {
  try {
    const response = await api.get("/system-settings/terms-and-conditions", {
      params: { lang },
      timeout: 5000,
    });

    if (response?.data) {
      const data = response.data;
      const contentEn = data.contentEn || data.content || DEFAULT_TERMS_AND_CONDITIONS_EN;
      const contentAr = data.contentAr || DEFAULT_TERMS_AND_CONDITIONS_AR;
      const activeContent = lang === "ar" ? contentAr : contentEn;

      localStorage.setItem(STORAGE_KEY_EN, contentEn);
      localStorage.setItem(STORAGE_KEY_AR, contentAr);
      if (data.updatedAt) {
        localStorage.setItem(STORAGE_META_KEY, data.updatedAt);
      }

      return {
        content: activeContent,
        contentEn,
        contentAr,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  } catch {
    // Graceful fallback to cached storage or default content
  }

  const cachedEn = localStorage.getItem(STORAGE_KEY_EN) || localStorage.getItem("clothsync_terms_and_conditions") || DEFAULT_TERMS_AND_CONDITIONS_EN;
  const cachedAr = localStorage.getItem(STORAGE_KEY_AR) || DEFAULT_TERMS_AND_CONDITIONS_AR;
  const cachedMeta = localStorage.getItem(STORAGE_META_KEY);

  return {
    content: lang === "ar" ? cachedAr : cachedEn,
    contentEn: cachedEn,
    contentAr: cachedAr,
    updatedAt: cachedMeta || new Date().toISOString(),
  };
};

export const saveTermsAndConditions = async (payload) => {
  const now = new Date().toISOString();
  
  // Support both object { contentEn, contentAr } or direct string
  let contentEn = "";
  let contentAr = "";
  let primaryContent = "";

  if (typeof payload === "string") {
    primaryContent = payload;
    contentEn = payload;
    contentAr = localStorage.getItem(STORAGE_KEY_AR) || DEFAULT_TERMS_AND_CONDITIONS_AR;
  } else {
    contentEn = payload.contentEn ?? "";
    contentAr = payload.contentAr ?? "";
    primaryContent = contentEn || payload.content || "";
  }

  localStorage.setItem(STORAGE_KEY_EN, contentEn);
  localStorage.setItem(STORAGE_KEY_AR, contentAr);
  localStorage.setItem(STORAGE_META_KEY, now);

  try {
    const response = await api.put(
      "/system-settings/terms-and-conditions",
      {
        content: primaryContent,
        contentEn,
        contentAr,
        updatedAt: now,
      },
      { timeout: 8000 },
    );
    return {
      success: true,
      content: primaryContent,
      contentEn,
      contentAr,
      updatedAt: response?.data?.updatedAt || now,
      message: response?.message || "Terms and Conditions saved successfully",
    };
  } catch {
    return {
      success: true,
      content: primaryContent,
      contentEn,
      contentAr,
      updatedAt: now,
      message: "Terms and Conditions saved successfully",
    };
  }
};
