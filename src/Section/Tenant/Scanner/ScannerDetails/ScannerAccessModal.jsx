import { useEffect, useState } from "react";
import { AlertTriangle, Copy, KeyRound, ShieldCheck } from "lucide-react";
import Modal from "../../../../Components/UI/Modal";
import Button from "../../../../Components/UI/Button";
import Alert from "../../../../Components/UI/Alert";
import { getApiErrorMessage } from "../../../../axios/api";

const policyLabels = {
  all_authorized_staff: "All authorized staff",
  specific_staff: "Specific staff",
  specific_role: "Specific role",
};

const ScannerAccessModal = ({ isOpen, scanner, staffOptions, roleOptions, policyOwnerType = "tenant", onClose, onSave, onRotate, onRevoke }) => {
  const [policyType, setPolicyType] = useState("all_authorized_staff");
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [error, setError] = useState("");
  const [credential, setCredential] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const policies = scanner?.accessPolicies || scanner?.policies || [];
    const first = policies[0];
    // Reset transient editor state whenever a policy session opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPolicyType(first?.policyType || "all_authorized_staff");
    setSelectedStaff(policies.filter((p) => p.policyType === "specific_staff").map((p) => p.staffId).filter(Boolean));
    setSelectedRoles(policies.filter((p) => p.policyType === "specific_role").map((p) => p.roleId).filter(Boolean));
    setCredential("");
    setError("");
  }, [isOpen, scanner]);

  const toggle = (setter, id) => setter((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const save = async () => {
    const policies = policyType === "all_authorized_staff"
      ? [{ policyType }]
      : (policyType === "specific_staff" ? selectedStaff : selectedRoles).map((id) => policyType === "specific_staff" ? { policyType, staffId: id, staffType: policyOwnerType } : { policyType, roleId: id, roleType: policyOwnerType });
    if (!policies.length) { setError(`Select at least one ${policyType === "specific_staff" ? "staff member" : "role"}.`); return; }
    setBusy(true); setError("");
    try { await onSave({ policies }); onClose(); } catch (e) { setError(getApiErrorMessage(e, "Unable to update scanner access policy.")); } finally { setBusy(false); }
  };
  const rotate = async () => { setBusy(true); setError(""); try { const result = await onRotate(); setCredential(result?.apiKey || result?.key || result?.data?.apiKey || ""); } catch (e) { setError(getApiErrorMessage(e, "Unable to rotate scanner credentials.")); } finally { setBusy(false); } };
  const revoke = async () => { setBusy(true); setError(""); try { await onRevoke(); setCredential(""); } catch (e) { setError(getApiErrorMessage(e, "Unable to revoke scanner credentials.")); } finally { setBusy(false); } };

  return <Modal open={isOpen} onClose={onClose} title="Access Policies & Credentials" description="Control who can use this scanner. Multiple staff members or roles can be selected." width={680} footer={<><Button onClick={onClose} disabled={busy} size="sm" variant="secondary">Cancel</Button><Button onClick={save} loading={busy} disabled={busy} size="sm">Save Access Policy</Button></>}>
    <div className="space-y-5">
      {error ? <Alert leftIcon={<AlertTriangle size={18} />} variant="danger">{error}</Alert> : null}
      <Alert leftIcon={<ShieldCheck size={18} />} variant="info">The logical Scanner ID <strong>{scanner?.id}</strong> is preserved. Access changes apply to this scanner only.</Alert>
      <label className="block text-sm font-bold text-(--theme-text-primary)">Access policy<select className="mt-2 w-full rounded-xl border border-(--theme-border-soft) bg-transparent px-3 py-2.5" value={policyType} onChange={(e) => setPolicyType(e.target.value)}><option value="all_authorized_staff">{policyLabels.all_authorized_staff}</option><option value="specific_staff">{policyLabels.specific_staff}</option><option value="specific_role">{policyLabels.specific_role}</option></select></label>
      {policyType === "specific_staff" ? <div className="grid gap-2 sm:grid-cols-2">{staffOptions.map((option) => <label className="flex items-center gap-2 text-sm" key={option.value}><input type="checkbox" checked={selectedStaff.includes(option.value)} onChange={() => toggle(setSelectedStaff, option.value)} />{option.label}</label>)}</div> : null}
      {policyType === "specific_role" ? <div className="grid gap-2 sm:grid-cols-2">{roleOptions.map((option) => <label className="flex items-center gap-2 text-sm" key={option.value}><input type="checkbox" checked={selectedRoles.includes(option.value)} onChange={() => toggle(setSelectedRoles, option.value)} />{option.label}</label>)}</div> : null}
      {onRotate && onRevoke ? <div className="border-t border-(--theme-border-soft) pt-4"><div className="mb-3 flex items-center gap-2"><KeyRound size={18} /><h3 className="m-0 text-base font-black">Scanner credential</h3></div><div className="flex flex-wrap gap-2"><Button onClick={rotate} disabled={busy} size="sm">Rotate Credential</Button><Button onClick={revoke} disabled={busy} size="sm" variant="danger">Revoke Credential</Button></div>{credential ? <Alert leftIcon={<KeyRound size={18} />} variant="warning"><p className="m-0">Copy this API key now. It will not be shown again and is not stored in browser storage.</p><div className="mt-2 flex gap-2"><code className="min-w-0 flex-1 break-all rounded bg-black/10 p-2 text-xs">{credential}</code><Button aria-label="Copy API key" onClick={() => navigator.clipboard?.writeText(credential)} size="sm" variant="secondary"><Copy size={15} /></Button></div></Alert> : null}</div> : null}
    </div>
  </Modal>;
};
export default ScannerAccessModal;
