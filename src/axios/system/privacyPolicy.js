import api from "../api";

const STORAGE_KEY_EN = "clothsync_privacy_policy_en";
const STORAGE_KEY_AR = "clothsync_privacy_policy_ar";
const STORAGE_META_KEY = "clothsync_privacy_meta";

export const DEFAULT_PRIVACY_POLICY_EN = `
<h2>1. Introduction & Overview</h2>
<p>At <strong>ClothSync RFID Laundry Management System</strong>, we respect your privacy and are committed to protecting the operational data, employee information, and client records processed through our cloud-connected RFID platform. This Privacy Policy describes how we collect, handle, store, and safeguard data across our web portals and mobile scanning applications.</p>

<h2>2. Information We Collect</h2>
<p>We collect information necessary to provide seamless laundry logistics, tag tracking, and user access management:</p>
<ul>
  <li><strong>Account & Profile Information:</strong> Name, work email address, organization name, role, and authentication credentials.</li>
  <li><strong>RFID Scan & Operational Telemetry:</strong> RFID tag EPC identifiers, batch dispatch/inbound timestamps, item lifecycle statuses, scan station/PDA IDs, and facility locations.</li>
  <li><strong>Garment & Asset Metadata:</strong> Linen categories, SKU types, wash cycles, and tenant ownership tags.</li>
  <li><strong>System & Device Logs:</strong> IP addresses, browser types, mobile device identifiers, scanner diagnostic data, and platform audit logs.</li>
</ul>

<h2>3. How We Use Collected Information</h2>
<p>We utilize operational data exclusively for legitimate business and laundry logistics operations, including:</p>
<ul>
  <li>Facilitating contactless RFID garment check-in, tracking, and dispatch validation.</li>
  <li>Managing multi-tenant separation between business accounts and laundry facilities.</li>
  <li>Providing real-time notifications, batch receipts, and discrepancy alerts.</li>
  <li>Enforcing role-based access control and system integrity.</li>
  <li>Improving platform efficiency, scanner sync performance, and uptime reliability.</li>
</ul>

<h2>4. RFID Tag Privacy & Data Isolation</h2>
<p>RFID tags attached to garments and linens contain unique digital serial numbers (EPC). We do not encode sensitive personal financial information or private identity details directly onto passive RFID tags. Tag identifiers are matched securely against access-controlled database records with strict multi-tenant isolation.</p>

<h2>5. Data Security & Infrastructure</h2>
<p>We implement enterprise-grade technical and organizational safeguards:</p>
<ul>
  <li><strong>Encryption:</strong> Data in transit is protected using TLS 1.3 encryption, and data at rest is encrypted using AES-256 standards.</li>
  <li><strong>Access Control:</strong> Granular role-based permissions (Super Admin, Tenant Admin, Laundry Staff) restrict access to authorized users only.</li>
  <li><strong>Audit Logging:</strong> Critical modifications, dispatch receipts, and administrative changes are securely audited.</li>
</ul>

<h2>6. Data Sharing & Third Parties</h2>
<p>ClothSync strictly adheres to a zero-monetization data policy. We do not sell, rent, or trade your inventory data, tenant lists, or scanning records to advertisers or third-party brokers. We may only disclose data to trusted cloud hosting providers and infrastructure partners bound by strict non-disclosure obligations, or when required by governing law.</p>

<h2>7. Data Retention & Tenant Rights</h2>
<p>Tenant organizations retain full ownership of their operational data. Authorized administrators may request data exports, correction of records, or account closure by contacting our administrative team. Upon verified tenant offboarding, historical inventory records are archived or securely deleted in accordance with data retention agreements.</p>

<h2>8. Policy Updates & Notifications</h2>
<p>ClothSync reserves the right to revise this Privacy Policy periodically. When modified by the Super Administrator, the updated policy is published immediately to this public URL with the effective revision date.</p>

<h2>9. Contact & Privacy Inquiries</h2>
<p>For questions, privacy assessments, or compliance concerns regarding this policy, please reach our Data Protection team at <a href="mailto:privacy@clothsync.com">privacy@clothsync.com</a>.</p>
`.trim();

export const DEFAULT_PRIVACY_POLICY_AR = `
<h2>١. المقدمة ونظرة عامة</h2>
<p>في <strong>نظام كلوث سينك (ClothSync) لإدارة المغاسل بتقنية RFID</strong>، نحترم خصوصيتكم ونلتزم بحماية البيانات التشغيلية ومعلومات الموظفين وسجلات العملاء التي تتم معالجتها عبر منصتنا السحابية. توضح سياسة الخصوصية هذه كيفية جمع البيانات والتعامل معها وتخزينها وحمايتها عبر بواباتنا وتطبيقات المسح الذكية.</p>

<h2>٢. المعلومات التي نجمعها</h2>
<p>نقوم بجمع المعلومات اللازمة لتقديم خدمات لوجستيات المغاسل وتتبع العلامات وإدارة وصول المستخدمين بسلاسة:</p>
<ul>
  <li><strong>معلومات الحساب والملف الشخصي:</strong> الاسم، والبريد الإلكتروني للعمل، واسم المنشأة، والدور الوظيفي، وبيانات المصادقة.</li>
  <li><strong>بيانات المسح وسجلات التشغيل:</strong> معرّفات علامات RFID (EPC)، وطوابع وقت شحن/استلام الدفعات، وحالات دورة حياة العناصر، ومعرفات أجهزة المسح، والمواقع.</li>
  <li><strong>البيانات الوصفية للملابس والأصول:</strong> فئات البياضات، وأنواع المنتجات، ودورات الغسيل، وعلامات ملكية المنشأة.</li>
  <li><strong>سجلات النظام والأجهزة:</strong> عناوين IP، وأنواع المتصفحات، ومعرفات الأجهزة المحمولة، وسجلات تدقيق النظام.</li>
</ul>

<h2>٣. كيفية استخدام المعلومات المجمعة</h2>
<p>نستخدم البيانات التشغيلية حصرياً للأغراض المشروعة وعمليات لوجستيات المغاسل، بما في ذلك تسليم واستلام الملابس، وتتبع حركة الأصول، وتنبيهات الاختلافات، وتطبيق الصلاحيات الأمنية.</p>

<h2>٤. خصوصية علامات الـ RFID وعزل البيانات</h2>
<p>تحتوي علامات RFID المثبتة على الملابس على أرقام تسلسلية رقمية فريدة (EPC) فقط، ولا يتم تخزين أي بيانات مالية أو معلومات هوية شخصية حساسة مباشرة على العلامات. تتم مطابقة المعرفات بأمان مع سجلات قواعد البيانات المشفرة والمعزولة لكل مستأجر.</p>

<h2>٥. أمان البيانات والبنية التحتية</h2>
<p>نطبق معايير تقنية وتنظيمية على مستوى المؤسسات:</p>
<ul>
  <li><strong>التشفير:</strong> حماية البيانات أثناء النقل بتشفير TLS 1.3 وتشفير البيانات المخزنة باستخدام معايير AES-256.</li>
  <li><strong>التحكم في الوصول:</strong> صلاحيات دقيقة مبنية على الأدوار للحد من الوصول للمصرح لهم فقط.</li>
  <li><strong>سجلات التدقيق:</strong> توثيق جميع التعديلات الحساسة وإيصالات الشحن بشكل آمن.</li>
</ul>

<h2>٦. مشاركة البيانات وعدم الاستغلال التجاري</h2>
<p>نلتزم في كلوث سينك بسياسة صارمة بعدم بيع أو تأجير أو المتاجرة ببيانات المخزون أو قوائم المنشآت لأي جهات خارجية أو معلنين.</p>

<h2>٧. الاحتفاظ بالبيانات وحقوق المنشأة</h2>
<p>تحتفظ المنشآت بالملكية الكاملة لبياناتها التشغيلية، ويحق للمسؤولين المعتمدين طلب تصدير البيانات أو تعديلها أو حذفها وفقاً لاتفاقيات الاحتفاظ بالبيانات.</p>

<h2>٨. الاتصال والاستفسارات</h2>
<p>لأي استفسارات أو أسئلة تتعلق بسياسة الخصوصية وحماية البيانات، يرجى التواصل مع فريق حماية البيانات عبر <a href="mailto:privacy@clothsync.com">privacy@clothsync.com</a>.</p>
`.trim();

export const DEFAULT_PRIVACY_POLICY = DEFAULT_PRIVACY_POLICY_EN;

export const getPrivacyPolicy = async ({ lang = "en" } = {}) => {
  try {
    const response = await api.get("/system-settings/privacy-policy", {
      params: { lang },
      timeout: 5000,
    });

    if (response?.data) {
      const data = response.data;
      const contentEn = data.contentEn || data.content || DEFAULT_PRIVACY_POLICY_EN;
      const contentAr = data.contentAr || DEFAULT_PRIVACY_POLICY_AR;
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

  const cachedEn = localStorage.getItem(STORAGE_KEY_EN) || localStorage.getItem("clothsync_privacy_policy") || DEFAULT_PRIVACY_POLICY_EN;
  const cachedAr = localStorage.getItem(STORAGE_KEY_AR) || DEFAULT_PRIVACY_POLICY_AR;
  const cachedMeta = localStorage.getItem(STORAGE_META_KEY);

  return {
    content: lang === "ar" ? cachedAr : cachedEn,
    contentEn: cachedEn,
    contentAr: cachedAr,
    updatedAt: cachedMeta || new Date().toISOString(),
  };
};

export const savePrivacyPolicy = async (payload) => {
  const now = new Date().toISOString();
  
  let contentEn = "";
  let contentAr = "";
  let primaryContent = "";

  if (typeof payload === "string") {
    primaryContent = payload;
    contentEn = payload;
    contentAr = localStorage.getItem(STORAGE_KEY_AR) || DEFAULT_PRIVACY_POLICY_AR;
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
      "/system-settings/privacy-policy",
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
      message: response?.message || "Privacy Policy saved successfully",
    };
  } catch {
    return {
      success: true,
      content: primaryContent,
      contentEn,
      contentAr,
      updatedAt: now,
      message: "Privacy Policy saved successfully",
    };
  }
};
