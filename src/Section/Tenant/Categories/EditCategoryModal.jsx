import { useFormik } from "formik";
import * as Yup from "yup";
import { CircleCheck, Tag } from "lucide-react";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { updateTenantCategory } from "../../../axios/categories/tenantCategories";
import { toast } from "../../../Utils/toast";
import { categoryStatusOptions } from "./data";

const validationSchema = Yup.object({
  englishTitle: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .required("English title is required"),
  englishDescription: Yup.string().trim(),
  status: Yup.string().oneOf(["active", "inactive"]).required(),
});

const EditCategoryModal = ({ category, onClose, onSaved }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      englishTitle: category?.name || "",
      englishDescription: category?.description || "",
      status: category?.status?.toLowerCase() || "active",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!category?.apiId) return;

      try {
        const response = await updateTenantCategory(category.apiId, {
          translations: {
            en: {
              title: values.englishTitle.trim(),
              description: values.englishDescription.trim(),
            },
          },
          status: values.status,
        });
        toast.success(response?.message || "Category updated successfully");
        onSaved?.();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to update category"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!category) return null;

  const handleClose = () => {
    if (!formik.isSubmitting) onClose?.();
  };
  const titleError =
    formik.touched.englishTitle && formik.errors.englishTitle
      ? formik.errors.englishTitle
      : "";

  return (
    <Modal
      closeOnBackdrop={!formik.isSubmitting}
      description="Update the English category title and description."
      footer={
        <>
          <Button
            disabled={formik.isSubmitting}
            onClick={handleClose}
            rounded="10px"
            size="sm"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            form="edit-category-form"
            leftIcon={<CircleCheck size={16} />}
            loading={formik.isSubmitting}
            rounded="10px"
            size="sm"
            type="submit"
            variant="success"
          >
            Update Category
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title="Edit Category"
      width={760}
    >
      <form
        className="grid gap-5"
        id="edit-category-form"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <Input
          error={Boolean(titleError)}
          helperText={titleError}
          label="English Title"
          leftIcon={<Tag size={18} />}
          name="englishTitle"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("englishTitle", value)}
          required
          value={formik.values.englishTitle}
        />
        <Input
          label="English Description"
          multiline
          name="englishDescription"
          onBlur={formik.handleBlur}
          onChange={(value) =>
            formik.setFieldValue("englishDescription", value)
          }
          rows={3}
          value={formik.values.englishDescription}
        />
        <Dropdown
          label="Status"
          onChange={(value) => formik.setFieldValue("status", value)}
          options={categoryStatusOptions.slice(1)}
          value={formik.values.status}
        />
      </form>
    </Modal>
  );
};

export default EditCategoryModal;
