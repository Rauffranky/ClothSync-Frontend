import { useState, useRef } from "react";
import {
  Upload,
  X,
  AlertCircle,
  FileImage,
  Loader2,
  CheckCircle2,
  Building2,
  TowelRack,
  Flag,
} from "lucide-react";
import Modal from "../UI/Modal";
import Input from "../UI/Input";
import Button from "../UI/Button";
import Dropdown from "../UI/Dropdown";
import { uploadMultipleFiles } from "../../axios/files/fileUpload";
import {
  createTenantComplaint,
  createLaundryComplaint,
} from "../../axios/complaints";
import { toast } from "../../Utils/toast";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent (Critical)" },
];

const CreateComplaintModal = ({
  open,
  onClose,
  onSubmitSuccess,
  role = "tenant", // 'tenant' | 'laundry'
  recipients = [], // array of linked parties: { id, name }
}) => {
  const [recipientId, setRecipientId] = useState(
    recipients.length === 1 ? recipients[0].id : "",
  );
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const isTenant = role === "tenant";
  const recipientLabel = isTenant ? "Target Laundry" : "Target Business";
  const recipientIcon = isTenant ? (
    <TowelRack size={16} className="text-(--color-aurora-teal)" />
  ) : (
    <Building2 size={16} className="text-(--color-aurora-teal)" />
  );

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

    // Maximum 8 images per complaint
    if (selectedFiles.length + validFiles.length > 8) {
      toast.error("You can upload a maximum of 8 images per complaint.");
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);

    // Generate local previews
    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    }));

    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    // Revoke object URL
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

  const resetForm = () => {
    filePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setRecipientId(recipients.length === 1 ? recipients[0].id : "");
    setSubject("");
    setDescription("");
    setPriority("medium");
    setSelectedFiles([]);
    setFilePreviews([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    setIsSubmitting(true);

    try {
      let uploadedImageUrls = [];

      // 1. Upload images to AWS S3 if files are attached
      if (selectedFiles.length > 0) {
        toast.info("Uploading complaint images to storage...");
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

      // 2. Prepare complaint payload
      const payload = {
        recipientId,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        images: uploadedImageUrls,
      };

      // 3. Dispatch to role-specific endpoint
      if (isTenant) {
        await createTenantComplaint(payload);
      } else {
        await createLaundryComplaint(payload);
      }

      toast.success("Complaint submitted successfully!");
      resetForm();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Complaint submission error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit complaint. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recipientOptions = recipients.map((r) => ({
    value: r.id,
    label: r.name || r.companyName || "Unnamed",
  }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        isTenant
          ? "Submit Complaint to Laundry"
          : "Submit Complaint to Business"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Selection & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-(--theme-text-secondary) mb-1.5 items-center gap-1.5">
              {recipientIcon}
              <span>{recipientLabel}</span>
              <span className="text-(--color-overdue)">*</span>
            </label>
            <Dropdown
              options={recipientOptions}
              value={recipientId}
              onChange={(val) => setRecipientId(val)}
              placeholder={`Select ${recipientLabel}`}
              disabled={recipients.length === 1 || isSubmitting}
            />
            {recipients.length === 0 && (
              <p className="mt-1 text-xs text-(--color-pending) flex items-center gap-1">
                <AlertCircle size={12} />
                No linked {isTenant ? "laundries" : "businesses"} found.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-(--theme-text-secondary) mb-1.5 flex items-center gap-1.5">
              <Flag size={14} className="text-(--color-aurora-teal)" />
              <span>Priority Level</span>
            </label>
            <Dropdown
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(val) => setPriority(val)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Complaint Subject */}
        <div>
          <Input
            label="Complaint Subject / Title"
            value={subject}
            onChange={(val) => setSubject(val)}
            placeholder="e.g. Missing linens in Batch #204, Damaged items received"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold text-(--theme-text-secondary) mb-1.5">
            Detailed Message / Description{" "}
            <span className="text-(--color-overdue)">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the issue in detail, include batch numbers, dates, item counts, or discrepancy details..."
            required
            disabled={isSubmitting}
            className="w-full rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3 text-sm text-(--theme-text-primary) placeholder:text-(--theme-text-muted) focus:border-(--color-aurora-teal) focus:outline-none transition-colors"
          />
        </div>

        {/* Multiple Image Upload Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-(--theme-text-secondary) flex items-center gap-1.5">
              <FileImage size={14} className="text-(--color-aurora-teal)" />
              <span>Attach Photos / Evidence (Optional)</span>
            </label>
            <span className="text-[11px] text-(--theme-text-muted)">
              Max 8 images (PNG, JPG, WEBP)
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
              isDragging
                ? "border-(--color-aurora-teal) bg-(--color-aurora-teal)/5"
                : "border-(--theme-border) bg-(--theme-surface-strong)/20 hover:border-(--color-aurora-teal)/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
                <Upload size={20} />
              </div>
              <p className="text-xs font-bold text-(--theme-text-primary)">
                Click to browse or drag & drop photos here
              </p>
              <p className="text-[11px] text-(--theme-text-muted)">
                High-resolution photos will be securely uploaded to S3 storage
              </p>
            </div>
          </div>

          {/* Uploaded Thumbnail Previews */}
          {filePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl border border-(--theme-border) bg-(--theme-surface) p-1 overflow-hidden"
                >
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="h-20 w-full object-cover rounded-lg"
                  />
                  <div className="mt-1 flex items-center justify-between px-1">
                    <span className="text-[10px] text-(--theme-text-muted) truncate max-w-20">
                      {preview.name}
                    </span>
                    <span className="text-[10px] text-(--theme-text-secondary) font-mono">
                      {preview.size}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-(--color-overdue) text-(--theme-surface-solid) shadow-sm hover:opacity-90 transition-opacity"
                    title="Remove image"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-(--theme-border)">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            disabled={isSubmitting || recipients.length === 0}
            leftIcon={
              isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )
            }
          >
            {isSubmitting ? "Uploading & Submitting..." : "Submit Complaint"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateComplaintModal;
