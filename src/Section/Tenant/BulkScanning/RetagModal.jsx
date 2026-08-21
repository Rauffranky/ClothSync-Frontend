import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Tag, Shirt } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getTenantCategories } from "../../../axios/categories/tenantCategories";

const RetagModal = ({ busy, latestEpc, onClose, onSubmit, open, row }) => {
  const [type, setType] = useState("category");
  const [assetName, setAssetName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [washLimit, setWashLimit] = useState("");
  const [reasonCode, setReasonCode] = useState("");
  const [reasonNotes, setReasonNotes] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!open) return;
    getTenantCategories({ page: 1, limit: 100, status: "active" })
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? {};
        setCategories(payload.items ?? payload.categories ?? payload.docs ?? []);
      })
      .catch(() => setCategories([]));
  }, [open, row]);

  const tagId = row?.tagId ?? row?.tag?.id ?? null;
  const categoryOptions = useMemo(() => categories.map((category) => ({
    label: category.name ?? category.title ?? category.categoryName ?? "Unnamed category",
    value: category.id ?? category._id ?? category.categoryId,
  })), [categories]);
  const canSubmit = Boolean(tagId && reasonCode.trim() && Number(washLimit) > 0 &&
    (type === "tag" ? latestEpc : assetName.trim() && categoryId));

  return (
    <Modal
      closeOnBackdrop={!busy}
      description="Register a new linen or asset and map it to the selected RFID tag."
      footer={<>
        <Button disabled={busy} onClick={onClose} variant="outline">Cancel</Button>
        <Button disabled={!canSubmit || busy} loading={busy} leftIcon={<CheckCircle2 size={17} />} onClick={() => onSubmit({
          type,
          ...(type === "tag" ? { tagId, newEpc: latestEpc, tagWashLimit: Number(washLimit) } : {
            tagId, categoryId, assetName: assetName.trim(), washLimit: Number(washLimit),
          }),
          reasonCode: reasonCode.trim(),
          ...(reasonNotes.trim() ? { reasonNotes: reasonNotes.trim() } : {}),
        })} variant="primary">
          {type === "tag" ? "Change Tag" : "Change Category"}
        </Button>
      </>}
      onClose={() => { if (!busy) onClose(); }}
      open={open}
      title="Retag"
      width={720}
    >
      <div className="space-y-5">
        <div className="flex gap-6">
          {[['category', 'Category Change'], ['tag', 'Tag Change']].map(([value, label]) => (
            <label className="flex cursor-pointer items-center gap-2 font-semibold" key={value}>
              <input checked={type === value} name="retag-type" onChange={() => setType(value)} type="radio" />
              {label}
            </label>
          ))}
        </div>
        <Alert variant="warning">
          Selected old tag: <span className="font-mono font-bold">{row?.epc ?? "—"}</span>
          {type === "tag" && <> · Scan replacement tag in Read Only mode: <span className="font-mono font-bold">{latestEpc ?? "waiting…"}</span></>}
        </Alert>
        {type === "category" ? <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Asset Name" leftIcon={<Shirt size={16} />} onChange={setAssetName} value={assetName} />
          <Dropdown label="Category" onChange={setCategoryId} options={categoryOptions} placeholder="Select category" value={categoryId} />
          <Input label="Category Wash Limit" leftIcon={<Tag size={16} />} onChange={setWashLimit} type="number" value={washLimit} />
        </div> : <Input label="Tag Wash Limit" leftIcon={<Tag size={16} />} onChange={setWashLimit} type="number" value={washLimit} />}
        <Input label="Reason Code" onChange={setReasonCode} placeholder="e.g. damaged_tag" value={reasonCode} />
        <Input label="Reason Notes" multiline onChange={setReasonNotes} placeholder="Explain the retagging reason" rows={3} value={reasonNotes} />
      </div>
    </Modal>
  );
};

export default RetagModal;
