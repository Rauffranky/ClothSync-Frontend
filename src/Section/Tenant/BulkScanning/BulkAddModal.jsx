import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CheckCircle2, Layers, MapPin, Shirt, Tag } from "lucide-react";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { getTenantCategories } from "../../../axios/categories/tenantCategories";
import { testTenantBulkAdd } from "../../../axios/scanners/tenantBulkScan";
import { toast } from "../../../Utils/toast";

const validationSchema = Yup.object({
  assetName: Yup.string().trim().required("Asset name is required"),
  categoryId: Yup.string().required("Category is required"),
  zoneName: Yup.string().trim().required("Zone is required"),
  washLimit: Yup.number()
    .typeError("Wash limit must be a number")
    .integer("Wash limit must be a whole number")
    .min(1, "Wash limit must be at least 1")
    .required("Wash limit is required"),
  description: Yup.string().trim(),
});

const getCategoryOptions = (response) => {
  const payload = response?.data ?? response ?? {};
  const items = payload.items ?? payload.categories ?? payload.docs ?? [];
  return (Array.isArray(items) ? items : [])
    .map((category) => ({
      label:
        category.title ??
        category.name ??
        category.translations?.en?.title ??
        "Unnamed Category",
      value: category.id ?? category._id,
    }))
    .filter((option) => option.value);
};

const BulkAddModal = ({ onClose, onSuccess, open, sessionId }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const formik = useFormik({
    initialValues: {
      assetName: "",
      categoryId: "",
      zoneName: "",
      washLimit: "",
      description: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await testTenantBulkAdd(sessionId, {
          assetName: values.assetName.trim(),
          categoryId: values.categoryId,
          zoneName: values.zoneName.trim(),
          washLimit: Number(values.washLimit),
          description: values.description.trim(),
        });
        toast.success(response?.message || "Bulk tags added to the system");
        formik.resetForm();
        onSuccess(response);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to add bulk tags"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) return undefined;
    let isActive = true;
    // Loading active categories is the external synchronization owned by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingCategories(true);
    setCategoriesError("");

    getTenantCategories({ page: 1, limit: 100, status: "active" })
      .then((response) => {
        if (!isActive) return;
        setCategoryOptions(getCategoryOptions(response));
      })
      .catch((error) => {
        if (!isActive) return;
        setCategoriesError(getApiErrorMessage(error, "Unable to load categories"));
        setCategoryOptions([]);
      })
      .finally(() => {
        if (isActive) setIsLoadingCategories(false);
      });

    return () => {
      isActive = false;
    };
  }, [open]);

  const closeModal = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      closeOnBackdrop={false}
      description="Register a new asset and map all selected new unlinked tags to it."
      footer={
        <>
          <Button disabled={formik.isSubmitting} onClick={closeModal} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={isLoadingCategories || categoryOptions.length === 0}
            leftIcon={<CheckCircle2 size={18} />}
            loading={formik.isSubmitting}
            onClick={formik.submitForm}
            variant="primary"
          >
            Add Asset
          </Button>
        </>
      }
      onClose={closeModal}
      open={open}
      title="Add New Asset"
      width={650}
    >
      <form className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={formik.handleSubmit}>
        <Input
          error={formik.touched.assetName ? formik.errors.assetName : undefined}
          label="Asset Name"
          leftIcon={<Shirt size={16} />}
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("assetName", value)}
          placeholder="e.g. King Duvet Cover"
          required
          value={formik.values.assetName}
          name="assetName"
        />
        <div>
          <label className="mb-1.5 block text-sm font-bold text-(--theme-text-primary)">
            Category <span className="text-red-500">*</span>
          </label>
          <Dropdown
            disabled={isLoadingCategories}
            onChange={(value) => formik.setFieldValue("categoryId", value)}
            options={categoryOptions}
            placeholder={isLoadingCategories ? "Loading categories..." : "Select category"}
            search
            value={formik.values.categoryId}
          />
          {(formik.touched.categoryId && formik.errors.categoryId) || categoriesError ? (
            <p className="mt-1 text-xs font-semibold text-(--color-overdue)">
              {categoriesError || formik.errors.categoryId}
            </p>
          ) : null}
        </div>
        <Input
          error={formik.touched.washLimit ? formik.errors.washLimit : undefined}
          label="Wash Limit"
          leftIcon={<Tag size={16} />}
          min={1}
          name="washLimit"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("washLimit", value)}
          required
          type="number"
          value={formik.values.washLimit}
        />
        <Input
          error={formik.touched.zoneName ? formik.errors.zoneName : undefined}
          label="Zone"
          leftIcon={<MapPin size={16} />}
          name="zoneName"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("zoneName", value)}
          placeholder="e.g. Downtown Hub"
          required
          value={formik.values.zoneName}
        />
        <div className="sm:col-span-2">
          <Input
            label="Description / Notes"
            leftIcon={<Layers size={16} />}
            multiline
            name="description"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("description", value)}
            placeholder="Fabric type, condition, notes..."
            rows={3}
            value={formik.values.description}
          />
        </div>
      </form>
    </Modal>
  );
};

export default BulkAddModal;
