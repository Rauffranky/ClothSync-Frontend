import { useMemo, useState } from "react";
import { Layers3, MapPin, Shirt, Ruler } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Dropdown from "../../../Components/UI/Dropdown";
import { categoryOptions, zoneOptions } from "./data";

const buildCategoryOptions = () =>
  categoryOptions.filter((option) => option.value !== "all");

const buildZoneOptions = () =>
  zoneOptions.filter((option) => option.value !== "all");

const EditAssetModal = ({ isOpen, onClose, asset }) => {
  const initialZone =
    buildZoneOptions().find((item) => asset?.location?.includes(item.value))?.value || "";
  const [assetName, setAssetName] = useState(asset?.name || "");
  const [category, setCategory] = useState(asset?.category || "");
  const [tagWashLimit, setTagWashLimit] = useState(
    asset?.washCount !== undefined ? String(asset.washCount) : "",
  );
  const [categoryWashLimit, setCategoryWashLimit] = useState(
    asset?.maxWash !== undefined ? String(asset.maxWash) : "",
  );
  const [zone, setZone] = useState(initialZone);
  const [notes, setNotes] = useState("");

  const categoryItems = useMemo(() => buildCategoryOptions(), []);
  const zoneItems = useMemo(() => buildZoneOptions(), []);

  const handleSubmit = () => {
    onClose?.();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Edit Asset"
      description="edit asset details"
      width={520}
      footer={
        <>
          <Button onClick={onClose} size="sm" variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} size="sm" variant="primary">
            Add Asset
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Asset Name"
            leftIcon={<Shirt size={16} />}
            onChange={setAssetName}
            placeholder="e.g. King Duvet Cover"
            required
            value={assetName}
          />
          <Dropdown
            label="Category"
            leftIcon={<Layers3 size={16} className="text-(--theme-text-muted)" />}
            onChange={setCategory}
            options={categoryItems}
            placeholder="Select category"
            value={category}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tag Wash Limit"
            onChange={setTagWashLimit}
            placeholder="Enter tag wash limit"
            type="number"
            value={tagWashLimit}
          />
          <Input
            label="Category Wash Limit"
            leftIcon={<Ruler size={16} />}
            onChange={setCategoryWashLimit}
            placeholder="Enter category wash limit"
            required
            type="number"
            value={categoryWashLimit}
          />
        </div>

        <Dropdown
          label="Zone"
          leftIcon={<MapPin size={16} className="text-(--theme-text-muted)" />}
          onChange={setZone}
          options={zoneItems}
          placeholder="Select zone"
          value={zone}
        />

        <Input
          label="Description / Notes"
          multiline
          onChange={setNotes}
          placeholder="Fabric type, condition, notes..."
          resize
          rows={4}
          value={notes}
        />
      </div>
    </Modal>
  );
};

export default EditAssetModal;
