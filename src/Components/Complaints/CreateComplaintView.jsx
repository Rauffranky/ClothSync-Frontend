import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Upload,
  X,
  AlertCircle,
  FileImage,
  Building2,
  TowelRack,
  Send,
  Info,
  ShieldCheck,
  Paperclip,
  Tag,
  FileText,
  ScanLine,
} from "lucide-react";
import Button from "../UI/Button";
import Card from "../UI/Card";
import Input from "../UI/Input";
import Dropdown from "../UI/Dropdown";
import Badge from "../UI/Badge";
import { uploadMultipleFiles } from "../../axios/files/fileUpload";
import {
  createTenantComplaint,
  createLaundryComplaint,
} from "../../axios/complaints";
import { getTenantLaundries } from "../../axios/laundries/tenantLaundries";
import { getLaundryTenants } from "../../axios/laundryTenants/laundryTenants";
import { toast } from "../../Utils/toast";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent (Critical)" },
];

const CreateComplaintView = ({ role = "tenant" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state || {};
  const isTenant = role === "tenant";
  const backRoute = isTenant ? "/business/complaints" : "/laundry/complaints";
  const recipientLabel = isTenant ? "Target Laundry" : "Target Business";

  const [recipients, setRecipients] = useState([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(true);
  const [complaintType, setComplaintType] = useState(() => {
    if (stateData.complaintType) return stateData.complaintType;
    if (
      stateData.selectedTags?.length > 0 ||
      stateData.batchName ||
      stateData.epc
    ) {
      return "tag_discrepancy";
    }
    return "general";
  });
  const [recipientId, setRecipientId] = useState(stateData.recipientId || "");
  const [subject, setSubject] = useState(stateData.subject || "");
  const [description, setDescription] = useState(stateData.description || "");
  const [priority, setPriority] = useState(stateData.priority || "medium");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch recipients on mount and accurately resolve names
  useEffect(() => {
    let isMounted = true;
    const fetchRecipients = async () => {
      setIsLoadingRecipients(true);
      try {
        if (isTenant) {
          const res = await getTenantLaundries({ limit: 50 });
          const list =
            res?.data?.data?.items ||
            res?.data?.items ||
            res?.data?.data ||
            res?.data ||
            [];
          if (isMounted) {
            const formatted = Array.isArray(list)
              ? list.map((item) => {
                  const laundryObj = item.laundry || item;
                  const laundryName =
                    item.laundryName ||
                    laundryObj.companyName ||
                    laundryObj.fullName ||
                    laundryObj.businessName ||
                    laundryObj.name ||
                    item.companyName ||
                    "Linked Laundry";
                  const resolvedId = item.laundryId || laundryObj.id || item.id;
                  return {
                    id: resolvedId,
                    name: laundryName,
                  };
                })
              : [];
            setRecipients(formatted);
            if (formatted.length === 1) {
              setRecipientId(formatted[0].id);
            }
          }
        } else {
          const res = await getLaundryTenants({ limit: 50 });
          const list =
            res?.data?.data?.items ||
            res?.data?.items ||
            res?.data?.data ||
            res?.data ||
            [];
          if (isMounted) {
            const formatted = Array.isArray(list)
              ? list.map((item) => {
                  const tenantObj = item.tenant || item;
                  const businessName =
                    item.businessName ||
                    tenantObj.businessName ||
                    tenantObj.companyName ||
                    tenantObj.fullName ||
                    tenantObj.name ||
                    item.companyName ||
                    "Partner Business";
                  const resolvedId = item.tenantId || tenantObj.id || item.id;
                  return {
                    id: resolvedId,
                    name: businessName,
                  };
                })
              : [];
            setRecipients(formatted);
            if (stateData.recipientId) {
              setRecipientId(stateData.recipientId);
            } else if (formatted.length === 1) {
              setRecipientId(formatted[0].id);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load recipients:", err);
          toast.error(
            `Unable to load linked ${isTenant ? "laundries" : "businesses"}.`,
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecipients(false);
        }
      }
    };

    fetchRecipients();
    return () => {
      isMounted = false;
    };
  }, [isTenant, stateData.recipientId]);

  const handleFilesSelected = (files) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (validFiles.length !== files.length) {
      toast.warning(
        "Some non-image files were skipped. Only images are supported.",
      );
    }

    if (!validFiles.length) return;

    if (selectedFiles.length + validFiles.length > 8) {
      toast.error("You can upload a maximum of 8 images per complaint.");
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);

    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    }));

    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    if (filePreviews[index]?.url) {
      URL.revokeObjectURL(filePreviews[index].url);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!recipientId) {
      toast.error(`Please select the ${recipientLabel.toLowerCase()}.`);
      return;
    }
    if (!subject.trim()) {
      toast.error("Please provide a complaint subject.");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      toast.error(
        "Please provide a detailed description (minimum 5 characters).",
      );
      return;
    }

    if (complaintType === "tag_discrepancy") {
      const hasTags =
        (stateData.selectedTags && stateData.selectedTags.length > 0) ||
        Boolean(stateData.epc);
      if (!hasTags && !stateData.batchName) {
        toast.error(
          "Tag & Batch Discrepancy complaints require at least one linked RFID tag or batch. Please select tags from Bulk Scanning.",
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let uploadedImageUrls = [];

      if (selectedFiles.length > 0) {
        setUploadStatusText("Uploading images to secure storage (S3)...");
        const uploadRes = await uploadMultipleFiles(
          selectedFiles,
          "complaints",
        );
        const uploadData = uploadRes?.data || uploadRes;

        if (Array.isArray(uploadData)) {
          uploadedImageUrls = uploadData
            .map((item) => item.fileUrl || item.url || item.path)
            .filter(Boolean);
        } else if (uploadData?.fileUrl) {
          uploadedImageUrls = [uploadData.fileUrl];
        }
      }

      setUploadStatusText("Submitting complaint details...");

      const payload = {
        recipientId,
        complaintType,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        images: uploadedImageUrls,
        ...(complaintType === "tag_discrepancy" && {
          ...(stateData.batchName && { batchName: stateData.batchName }),
          ...(stateData.assetName && { assetName: stateData.assetName }),
          ...(stateData.epc && { tagEpc: stateData.epc }),
          ...(stateData.selectedTags && {
            tags: stateData.selectedTags.map((t) => ({
              epc: t.epc,
              assetName: t.assetName,
              batchName: t.resolvedBatchName || t.batchName,
              batchType: t.batchType,
            })),
          }),
        }),
      };

      if (isTenant) {
        await createTenantComplaint(payload);
      } else {
        await createLaundryComplaint(payload);
      }

      toast.success("Complaint submitted successfully!");
      filePreviews.forEach((p) => URL.revokeObjectURL(p.url));
      navigate(backRoute);
    } catch (err) {
      console.error("Complaint submission error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit complaint. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadStatusText("");
    }
  };

  const recipientOptions = recipients.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const selectedRecipientName =
    recipients.find((r) => r.id === recipientId)?.name || "Not selected";

  const getPriorityBadgeVariant = (val) => {
    switch (val) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--theme-text-primary)">
            {isTenant
              ? "Submit Complaint to Laundry"
              : "Submit Complaint to Business"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(backRoute)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Send size={16} />}
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              isLoadingRecipients ||
              recipients.length === 0 ||
              (complaintType === "tag_discrepancy" &&
                !stateData.selectedTags?.length &&
                !stateData.epc &&
                !stateData.batchName)
            }
            onClick={handleSubmit}
          >
            Submit Complaint
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Fields & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Category Selector (Option 1 vs Option 2) */}
          <Card className="p-4 bg-(--theme-surface) border border-(--theme-border) shadow-xs">
            <div className="mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--theme-text-secondary)">
                Select Complaint Type
              </h3>
              <p className="text-xs text-(--theme-text-muted) mt-0.5">
                Choose between a general operational issue or a specific RFID tag & batch discrepancy
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: General Complaint */}
              <button
                type="button"
                onClick={() => setComplaintType("general")}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  complaintType === "general"
                    ? "border-(--color-aurora-teal) bg-(--color-aurora-teal)/5 ring-2 ring-(--color-aurora-teal)/20"
                    : "border-(--theme-border) bg-(--theme-surface-strong)/40 hover:bg-(--theme-surface-strong)/70"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    complaintType === "general"
                      ? "bg-(--color-aurora-teal) text-white shadow-xs"
                      : "bg-(--theme-surface) text-(--theme-text-secondary)"
                  }`}
                >
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-(--theme-text-primary)">
                      1. General Complaint
                    </span>
                    {complaintType === "general" && (
                      <Badge variant="primary" size="sm">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-(--theme-text-secondary) mt-1 leading-relaxed">
                    Delivery, billing, service feedback, or fabric quality issues. No RFID tags needed.
                  </p>
                </div>
              </button>

              {/* Option 2: Tag & Batch Discrepancy */}
              <button
                type="button"
                onClick={() => setComplaintType("tag_discrepancy")}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  complaintType === "tag_discrepancy"
                    ? "border-(--color-aurora-teal) bg-(--color-aurora-teal)/5 ring-2 ring-(--color-aurora-teal)/20"
                    : "border-(--theme-border) bg-(--theme-surface-strong)/40 hover:bg-(--theme-surface-strong)/70"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    complaintType === "tag_discrepancy"
                      ? "bg-(--color-aurora-teal) text-white shadow-xs"
                      : "bg-(--theme-surface) text-(--theme-text-secondary)"
                  }`}
                >
                  <ScanLine size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-(--theme-text-primary)">
                      2. Tag & Batch Discrepancy
                    </span>
                    {complaintType === "tag_discrepancy" && (
                      <Badge variant="primary" size="sm">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-(--theme-text-secondary) mt-1 leading-relaxed">
                    RFID tags linked to an Active Batch or Last Linked Batch with missing/mismatched linen.
                  </p>
                </div>
              </button>
            </div>
          </Card>

          {/* Tag & Batch Discrepancy: Associated Scanned Tag & Batch Details Card */}
          {complaintType === "tag_discrepancy" &&
            (stateData.selectedTags?.length > 0 ||
              (stateData.batchName && stateData.epc)) && (
              <Card className="border-l-4 border-l-(--color-aurora-teal) bg-(--theme-surface) p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--theme-border) pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
                      <Tag size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-(--theme-text-primary)">
                        Associated Tag & Batch Details
                      </h3>
                      <p className="text-xs text-(--theme-text-muted)">
                        {stateData.selectedTags?.length || 1} scanned RFID tag(s)
                        linked to this complaint
                      </p>
                    </div>
                  </div>
                  {stateData.batchName && (
                    <Badge
                      size="sm"
                      variant={
                        stateData.batchType === "active" ? "primary" : "purple"
                      }
                    >
                      {stateData.batchType === "active"
                        ? "Active Batch"
                        : "Last Linked Batch"}
                      : {stateData.batchName}
                    </Badge>
                  )}
                </div>

                <div className="max-h-52 divide-y divide-(--theme-border)/50 overflow-y-auto pr-1">
                  {(
                    stateData.selectedTags || [
                      {
                        epc: stateData.epc,
                        assetName: stateData.assetName,
                        resolvedBatchName: stateData.batchName,
                        batchType: stateData.batchType,
                        businessName: stateData.partnerName,
                      },
                    ]
                  ).map((item, idx) => (
                    <div
                      key={item.epc || idx}
                      className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="rounded bg-(--theme-surface-strong)/60 px-2 py-0.5 font-mono text-xs font-bold text-(--theme-text-primary)">
                          {item.epc}
                        </span>
                        <span className="font-semibold text-(--theme-text-primary)">
                          {item.assetName || "Standard Linen"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-(--theme-text-muted)">
                          Batch:{" "}
                          <strong className="text-(--theme-text-primary)">
                            {item.resolvedBatchName || stateData.batchName}
                          </strong>
                        </span>
                        <Badge
                          size="sm"
                          variant={
                            item.batchType === "active" ? "primary" : "purple"
                          }
                        >
                          {item.batchType === "active" ? "Active" : "Last Linked"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* Tag & Batch Discrepancy: Alert when no tags/batch are present */}
          {complaintType === "tag_discrepancy" &&
            !stateData.selectedTags?.length &&
            !stateData.epc &&
            !stateData.batchName && (
              <Card className="border-l-4 border-l-(--color-overdue) bg-(--color-overdue)/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-(--color-overdue)/15 text-(--color-overdue) shrink-0">
                    <AlertCircle size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-(--theme-text-primary)">
                      No Scanned RFID Tags Attached
                    </h4>
                    <p className="text-xs text-(--theme-text-secondary) leading-relaxed">
                      Tag & Batch Discrepancy complaints require verified RFID tags linked to an active or past batch.
                      If a tag is not linked to any business partner or batch, a complaint cannot be filed.
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ScanLine size={14} />}
                    onClick={() =>
                      navigate(
                        isTenant ? "/business/bulk-scanning" : "/laundry/bulk-scanning",
                      )
                    }
                  >
                    Go to Bulk Scanning to Scan Tags
                  </Button>
                </div>
              </Card>
            )}

          {/* Card 1: Form Information */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-(--theme-border)">
              <div className="w-8 h-8 rounded-lg bg-(--color-aurora-teal)/10 flex items-center justify-center text-(--color-aurora-teal)">
                {isTenant ? <TowelRack size={18} /> : <Building2 size={18} />}
              </div>
              <div>
                <h2 className="text-base font-bold text-(--theme-text-primary)">
                  Complaint Information
                </h2>
                <p className="text-xs text-(--theme-text-secondary)">
                  Specify the recipient organization and urgency of the matter
                </p>
              </div>
            </div>

            {/* Recipient & Priority using Global Predefined Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Dropdown
                  label={recipientLabel}
                  options={recipientOptions}
                  value={recipientId}
                  onChange={(val) => setRecipientId(val)}
                  placeholder={
                    isLoadingRecipients
                      ? "Loading recipients..."
                      : `Select ${recipientLabel}`
                  }
                  disabled={
                    isLoadingRecipients ||
                    recipients.length === 1 ||
                    isSubmitting
                  }
                  required
                />
                {!isLoadingRecipients && recipients.length === 0 && (
                  <p className="mt-2 text-xs text-(--color-pending) flex items-center gap-1">
                    <AlertCircle size={14} />
                    No linked {isTenant ? "laundries" : "businesses"} found in
                    your account.
                  </p>
                )}
              </div>

              <div>
                <Dropdown
                  label="Priority Level"
                  options={PRIORITY_OPTIONS}
                  value={priority}
                  onChange={(val) => setPriority(val)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Subject Input using Global Predefined Input */}
            <div>
              <Input
                label="Complaint Subject / Title"
                value={subject}
                onChange={(val) => setSubject(val)}
                placeholder="e.g. Missing linens in Batch #204, Damaged tablecloths on arrival"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Description using Global Predefined Input (multiline) */}
            <div>
              <Input
                label="Detailed Description"
                multiline
                rows={5}
                resize={true}
                value={description}
                onChange={(val) => setDescription(val)}
                placeholder="Explain the issue comprehensively. Include batch numbers, dates, exact item counts, discrepancy details, or observed physical defects..."
                required
                disabled={isSubmitting}
                helperText={`${description.length} characters`}
              />
            </div>
          </Card>

          {/* Card 2: Photo Evidence */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-(--theme-border)">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-(--color-aurora-teal)/10 flex items-center justify-center text-(--color-aurora-teal)">
                  <FileImage size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-(--theme-text-primary)">
                    Attach Photographic Evidence
                  </h2>
                  <p className="text-xs text-(--theme-text-secondary)">
                    Upload photos showing the discrepancies, damage tags, or
                    shipment labels
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">
                {selectedFiles.length} / 8 Images
              </Badge>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-(--color-aurora-teal) bg-(--color-aurora-teal)/5"
                  : "border-(--theme-border) hover:border-(--color-aurora-teal)/60 hover:bg-(--theme-card-bg)"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesSelected(e.target.files);
                    e.target.value = "";
                  }
                }}
                disabled={isSubmitting || selectedFiles.length >= 8}
              />
              <div className="w-12 h-12 rounded-full bg-(--color-aurora-teal)/10 text-(--color-aurora-teal) flex items-center justify-center mx-auto mb-3">
                <Upload size={22} />
              </div>
              <p className="text-sm font-semibold text-(--theme-text-primary)">
                Click to browse or drag & drop photos here
              </p>
              <p className="text-xs text-(--theme-text-secondary) mt-1.5">
                Supports JPG, PNG, WEBP up to 10MB each. Maximum 8 photos.
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 text-[11px] text-(--color-aurora-teal) bg-(--color-aurora-teal)/10 px-3 py-1 rounded-full">
                <ShieldCheck size={14} />
                <span>
                  High-resolution photos will be securely uploaded to AWS S3
                  storage
                </span>
              </div>
            </div>

            {/* Previews Grid */}
            {filePreviews.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-(--theme-text-secondary) uppercase tracking-wider">
                  Selected Evidence ({filePreviews.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border border-(--theme-border) bg-(--theme-card-bg) shadow-xs"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-black/5 flex items-center justify-center">
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-medium text-(--theme-text-primary) truncate">
                          {preview.name}
                        </p>
                        <p className="text-[10px] text-(--theme-text-secondary)">
                          {preview.size}
                        </p>
                      </div>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-(--color-overdue) transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-(--theme-text-primary) pb-3 border-b border-(--theme-border)">
              Ticket Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-(--theme-text-secondary)">
                  Recipient:
                </span>
                <span className="font-semibold text-(--theme-text-primary) truncate max-w-37.5">
                  {selectedRecipientName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-(--theme-text-secondary)">Priority:</span>
                <Badge variant={getPriorityBadgeVariant(priority)} size="sm">
                  {PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ||
                    "Medium Priority"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-(--theme-text-secondary)">
                  Evidence Photos:
                </span>
                <span className="font-semibold text-(--theme-text-primary) flex items-center gap-1">
                  <Paperclip size={12} />
                  {selectedFiles.length} attached
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-(--theme-text-secondary)">Type:</span>
                <Badge
                  variant={complaintType === "tag_discrepancy" ? "purple" : "primary"}
                  size="sm"
                >
                  {complaintType === "tag_discrepancy"
                    ? "Tag Discrepancy"
                    : "General Complaint"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-(--theme-text-secondary)">
                  Initial Status:
                </span>
                <Badge variant="warning" size="sm">
                  Pending Review
                </Badge>
              </div>
            </div>

            {uploadStatusText && (
              <div className="p-3 rounded-lg bg-(--color-aurora-teal)/10 border border-(--color-aurora-teal)/20 text-xs text-(--color-aurora-teal)">
                {uploadStatusText}
              </div>
            )}

            {/* Action Buttons using Global Predefined Button component */}
            <div className="pt-3 space-y-2.5">
              <Button
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<Send size={16} />}
                loading={isSubmitting}
                disabled={
                  isSubmitting ||
                  isLoadingRecipients ||
                  recipients.length === 0 ||
                  (complaintType === "tag_discrepancy" &&
                    !stateData.selectedTags?.length &&
                    !stateData.epc &&
                    !stateData.batchName)
                }
                onClick={handleSubmit}
              >
                Submit Complaint
              </Button>
              <Button
                variant="outline"
                size="md"
                fullWidth
                disabled={isSubmitting}
                onClick={() => navigate(backRoute)}
              >
                Cancel & Return
              </Button>
            </div>
          </Card>

          {/* Guidelines */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-(--color-aurora-teal)">
              <Info size={16} />
              <h4 className="text-xs font-bold text-(--theme-text-primary)">
                Guidelines for Faster Resolution
              </h4>
            </div>
            <ul className="text-[12px] text-(--theme-text-secondary) space-y-2 leading-relaxed list-disc list-inside">
              <li>Include the specific Batch ID or Delivery Slip number.</li>
              <li>Specify exact item names and count discrepancies.</li>
              <li>Attach clear photos of damaged fabrics or torn tags.</li>
              <li>
                Urgent priority should be reserved for operational blockers.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaintView;
