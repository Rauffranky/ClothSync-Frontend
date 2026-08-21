import { useState } from "react";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";

const RetagStatusModal = ({ action, busy, onClose, onSubmit, row }) => {
  const [reasonCode, setReasonCode] = useState("");
  const [reasonNotes, setReasonNotes] = useState("");
  const [retireTagAs, setRetireTagAs] = useState("retired");
  const isLost = action === "mark_lost";
  const tagId = row?.tagId ?? row?.tag?.id;
  const canSubmit = Boolean(tagId && reasonCode.trim());

  return (
    <Modal
      closeOnBackdrop={!busy}
      description={`Update status for selected tag ${row?.epc ?? ""}.`}
      footer={<>
        <Button disabled={busy} onClick={onClose} variant="outline">Cancel</Button>
        <Button disabled={!canSubmit || busy} loading={busy} onClick={() => onSubmit({
          tagId,
          reasonCode: reasonCode.trim(),
          ...(reasonNotes.trim() ? { reasonNotes: reasonNotes.trim() } : {}),
          ...(!isLost ? { retireTagAs } : {}),
        })} variant="primary">
          {isLost ? "Mark Lost" : "Retire Tag"}
        </Button>
      </>}
      onClose={() => { if (!busy) onClose(); }}
      open
      title={isLost ? "Mark Tag Lost" : "Retire Tag"}
      width={520}
    >
      <div className="space-y-4">
        {!isLost && <Dropdown label="Retire tag as" onChange={setRetireTagAs} options={[{ label: "Retired", value: "retired" }, { label: "Damaged", value: "damaged" }]} value={retireTagAs} />}
        <Input label="Reason Code" onChange={setReasonCode} placeholder={isLost ? "e.g. lost_tag" : "e.g. damaged_tag"} value={reasonCode} />
        <Input label="Reason Notes" multiline onChange={setReasonNotes} placeholder="Explain the reason" rows={3} value={reasonNotes} />
      </div>
    </Modal>
  );
};

export default RetagStatusModal;
