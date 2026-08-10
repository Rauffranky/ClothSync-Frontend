import { Tags } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import Table from "../../../Components/UI/Table";

const itemColumns = [
  { key: "epc", label: "Tag EPC", render: (value) => <span className="font-mono font-bold">{value}</span> },
  { key: "tagCode", label: "Tag Code" },
  { key: "assetName", label: "Asset Name" },
  { key: "assetCode", label: "Asset ID" },
  { key: "category", label: "Category" },
  { key: "status", label: "Item Status", render: (value) => <Badge size="sm" variant="neutral">{value}</Badge> },
];

const BatchDetailsModal = ({ batch, error, isLoading, onClose }) => (
  <Modal
    description={`${batch?.business || ""} · ${batch?.location || ""}`}
    footer={
      <>
        <Button onClick={onClose} variant="secondary">Close</Button>
      </>
    }
    onClose={onClose}
    open={Boolean(batch)}
    title={batch?.id}
    width={980}
  >
    {isLoading ? (
      <p className="text-sm font-semibold text-(--theme-text-muted)">Loading batch details...</p>
    ) : error ? (
      <Alert variant="danger">{error}</Alert>
    ) : batch && (
      <div className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Business", batch.business], ["Status", batch.status],
            ["Dispatch location", batch.location], ["Dispatch date", batch.dispatchAt],
            ["Total tags", batch.total], ["Notes", batch.notes],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-black uppercase tracking-wide text-(--theme-text-muted)">{label}</dt>
              <dd className="m-0 mt-1 font-semibold text-(--theme-text-primary)">{value}</dd>
            </div>
          ))}
        </dl>
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-(--theme-text-primary)"><Tags size={16} /> Batch Items</h3>
          <Table columns={itemColumns} compact data={batch.items || []} emptyText="No batch items returned" rowKey="id" />
        </div>
      </div>
    )}
  </Modal>
);

export default BatchDetailsModal;
