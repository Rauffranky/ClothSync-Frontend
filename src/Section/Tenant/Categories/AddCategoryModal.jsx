import { useFormik } from "formik";
import * as Yup from "yup";
import { CircleCheck, Tag } from "lucide-react";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { createTenantCategory } from "../../../axios/categories/tenantCategories";
import { toast } from "../../../Utils/toast";

const initialValues = {
  englishTitle: "",
  englishDescription: "",
};

const validationSchema = Yup.object({
  englishTitle: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .required("English title is required"),
  englishDescription: Yup.string().trim(),
});

const AddCategoryModal = ({ onClose, onSaved, open = false }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const response = await createTenantCategory({
          translations: {
            en: {
              title: values.englishTitle.trim(),
              description: values.englishDescription.trim(),
            },
          },
          status: "active",
        });
        toast.success(response?.message || "Category created successfully");
        resetForm();
        onSaved?.();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to create category"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    onClose?.();
  };

  const titleError =
    formik.touched.englishTitle && formik.errors.englishTitle
      ? formik.errors.englishTitle
      : "";

  return (
    <Modal
      closeOnBackdrop={!formik.isSubmitting}
      description="Create a new category for inventory organization, tag mapping, batching, and reporting."
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
            form="add-category-form"
            leftIcon={<CircleCheck size={16} />}
            loading={formik.isSubmitting}
            rounded="10px"
            size="sm"
            type="submit"
            variant="success"
          >
            Add Category
          </Button>
        </>
      }
      onClose={handleClose}
      open={open}
      title="Add Category"
      width={760}
    >
      <form
        className="grid gap-5"
        id="add-category-form"
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
          placeholder="e.g. Shirts"
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
          placeholder="RFID-tagged shirts and tops"
          rows={3}
          value={formik.values.englishDescription}
        />
      </form>
    </Modal>
  );
};

export default AddCategoryModal;
