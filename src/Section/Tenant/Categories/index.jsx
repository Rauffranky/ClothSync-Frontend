import { useEffect, useState } from "react";
import { CircleCheck, Plus, Search, Tag } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import Pagination from "../../../Components/UI/Pagination";
import {
  getSearchQuery,
  useDebouncedSearch,
} from "../../../Hooks/useDebouncedSearch";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import CategoriesTable from "./CategoriesTable";
import Stats from "./Stats";
import {
  getTenantCategories,
  createTenantCategory,
  updateTenantCategory,
  updateTenantCategoryStatus,
} from "../../../axios/categories/tenantCategories";
import { getApiErrorMessage } from "../../../axios/api";
import { toast } from "../../../Utils/toast";
import { formatDateWithUserPreferences } from "../../../Utils/date";

const ITEMS_PER_PAGE = 5;

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const useOptions = [
  { label: "All Usage", value: "all" },
  { label: "In Use", value: "in use" },
  { label: "Not In Use", value: "not in use" },
];

const addCategoryInitialValues = {
  englishTitle: "",
  englishDescription: "",
  // arabicTitle: "",
  // arabicDescription: "",
};

const addCategoryValidationSchema = Yup.object({
  englishTitle: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .required("English title is required"),
  englishDescription: Yup.string().trim(),
  // arabicTitle: Yup.string().trim(),
  // arabicDescription: Yup.string().trim(),
});

const normalizeCategory = (category) => {
  const status = String(category.status || "inactive").toLowerCase();
  const translation = category.translations?.en || {};
  const assetCount = Number(
    category.assetCount ?? category.assetsCount ?? category.assets?.length ?? 0,
  );
  const isUsed = category.usageStatus
    ? String(category.usageStatus).toLowerCase() === "in use"
    : assetCount > 0;

  return {
    ...category,
    apiId: category._id || category.id,
    id: category.categoryId || category.code || category._id || category.id,
    name:
      category.title ||
      category.name ||
      category.categoryName ||
      translation.title ||
      "Unnamed Category",
    description:
      category.description || translation.description || "",
    status: status === "active" ? "Active" : "Inactive",
    statusVariant: status === "active" ? "success" : "danger",
    usage: isUsed ? "In Use" : "Not in Use",
    usageState: isUsed ? "used" : "unused",
    assets: assetCount || null,
    created: formatDateWithUserPreferences(category.createdAt || category.created),
    lastUpdated: formatDateWithUserPreferences(category.updatedAt || category.lastUpdated),
  };
};

const Categories = () => {
  const [categoryRows, setCategoryRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedSearch(searchValue);
  const [statusFilter, setStatusFilter] = useState("all");
  const [useFilter, setUseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getTenantCategories({
      page: currentPage + 1,
      limit: ITEMS_PER_PAGE,
      ...(debouncedSearch ? { keywords: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(useFilter !== "all" ? { use: useFilter } : {}),
    })
      .then((response) => {
        if (!isActive) return;
        const payload = response?.data ?? response;
        const rows = Array.isArray(payload)
          ? payload
          : payload?.items ||
            payload?.categories ||
            payload?.docs ||
            payload?.results ||
            [];
        setCategoryRows(rows.map(normalizeCategory));
        const pagination = payload?.pagination || payload?.meta || payload;
        setTotalItems(
          Number(
            pagination?.totalItems ??
              pagination?.totalDocs ??
              pagination?.total ??
              rows.length,
          ),
        );
        setTotalPages(
          Number(
            pagination?.totalPages ??
              pagination?.pages ??
              Math.ceil(
                Number(
                  pagination?.totalItems ??
                    pagination?.totalDocs ??
                    pagination?.total ??
                    rows.length,
                ) / ITEMS_PER_PAGE,
              ),
          ),
        );
      })
      .catch((error) => {
        if (isActive) {
          setCategoryRows([]);
          setTotalItems(0);
          setTotalPages(0);
          toast.error(getApiErrorMessage(error, "Unable to load categories"));
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, refreshKey, statusFilter, useFilter]);

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(categoryRows);
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const resetCurrentPage = () => {
    setCurrentPage(0);
  };

  const handleSearchChange = (value) => {
    if (getSearchQuery(value) !== debouncedSearch) {
      setIsLoading(true);
    }
    setSearchValue(value);
    resetCurrentPage();
  };

  const handleStatusFilterChange = (value) => {
    setIsLoading(true);
    setStatusFilter(value);
    resetCurrentPage();
  };

  const handleUseFilterChange = (value) => {
    setIsLoading(true);
    setUseFilter(value);
    resetCurrentPage();
  };

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
    resetCurrentPage();
  };

  const addCategoryFormik = useFormik({
    initialValues: addCategoryInitialValues,
    validationSchema: addCategoryValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        await createTenantCategory({
          translations: {
            en: {
              title: values.englishTitle.trim(),
              description: values.englishDescription.trim(),
            },
            // Arabic translation will be enabled in a later phase.
            // ar: {
            //   title: values.arabicTitle.trim(),
            //   description: values.arabicDescription.trim(),
            // },
          },
          status: "active",
        });
        toast.success("Category created successfully");
        setIsAddModalOpen(false);
        resetForm();
        setCurrentPage(0);
        setIsLoading(true);
        setRefreshKey((current) => current + 1);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to create category"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    addCategoryFormik.resetForm();
  };

  const handleStatusChange = async (categoryId, nextStatus) => {
    const category = categoryRows.find((item) => item.id === categoryId);

    try {
      await updateTenantCategoryStatus(
        category?.apiId || categoryId,
        nextStatus.toLowerCase(),
      );

      setCategoryRows((current) =>
        current.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                status: nextStatus,
                statusVariant: nextStatus === "Active" ? "success" : "danger",
              }
            : category,
        ),
      );
      setRefreshKey((current) => current + 1);
      toast.success(`Category set to ${nextStatus.toLowerCase()}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update category status"));
      throw error;
    }
  };

  const editCategoryFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      englishTitle: editingCategory?.name || "",
      englishDescription: editingCategory?.description || "",
      status: editingCategory?.status?.toLowerCase() || "active",
    },
    validationSchema: Yup.object({
      englishTitle: Yup.string()
        .trim()
        .min(2, "Category name must be at least 2 characters")
        .required("English title is required"),
      englishDescription: Yup.string().trim(),
      status: Yup.string().oneOf(["active", "inactive"]).required(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!editingCategory) return;

      try {
        await updateTenantCategory(editingCategory.apiId, {
          translations: {
            en: {
              title: values.englishTitle.trim(),
              description: values.englishDescription.trim(),
            },
          },
          status: values.status,
        });
        toast.success("Category updated successfully");
        setEditingCategory(null);
        setIsLoading(true);
        setRefreshKey((current) => current + 1);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to update category"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const closeEditModal = () => {
    setEditingCategory(null);
    editCategoryFormik.resetForm();
  };

  return (
    <>
      <div className="space-y-5">
        <Stats refreshKey={refreshKey} />

        <Card padding="0" rounded="18px">
          <div className="grid gap-3 border-b border-(--theme-border) px-4 py-4 lg:grid-cols-[minmax(240px,1fr)_170px_170px_auto]">
            <Input
              leftIcon={<Search size={16} />}
              onChange={handleSearchChange}
              placeholder="Search categories..."
              value={searchValue}
            />
            <Dropdown
              onChange={handleStatusFilterChange}
              options={statusOptions}
              value={statusFilter}
            />
            <Dropdown
              onChange={handleUseFilterChange}
              options={useOptions}
              value={useFilter}
            />
            <Button
              leftIcon={<Plus size={16} />}
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              variant="secondary"
            >
              Add Category
            </Button>
          </div>

          <div className="px-4 py-4">
            <CategoriesTable
              data={sortedData}
              loading={isLoading}
              onEditCategory={setEditingCategory}
              onSort={handleTableSort}
              onStatusChange={handleStatusChange}
              sortBy={sortBy}
              sortDirection={sortDirection}
            />
            <Pagination
              forcePage={activePage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={({ selected }) => {
                setIsLoading(true);
                setCurrentPage(selected);
              }}
              pageCount={totalPages}
              totalItems={totalItems}
            />
          </div>
        </Card>
      </div>

      <Modal
        description="Create a new category for inventory organization, tag mapping, batching, and reporting."
        footer={
          <>
            <Button
              onClick={closeAddModal}
              rounded="10px"
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              form="add-category-form"
              leftIcon={<CircleCheck size={16} />}
              loading={addCategoryFormik.isSubmitting}
              rounded="10px"
              size="sm"
              type="submit"
              variant="success"
            >
              Add Category
            </Button>
          </>
        }
        onClose={closeAddModal}
        open={isAddModalOpen}
        title="Add Category"
        width={760}
      >
        <form
          className="grid gap-5"
          id="add-category-form"
          onSubmit={addCategoryFormik.handleSubmit}
        >
          <Input
            error={addCategoryFormik.touched.englishTitle && Boolean(addCategoryFormik.errors.englishTitle)}
            helperText={
              addCategoryFormik.touched.englishTitle
                ? addCategoryFormik.errors.englishTitle
                : ""
            }
            label="English Title"
            leftIcon={<Tag size={18} />}
            name="englishTitle"
            onBlur={addCategoryFormik.handleBlur}
            onChange={(value) => addCategoryFormik.setFieldValue("englishTitle", value)}
            placeholder="e.g. Shirts"
            required
            value={addCategoryFormik.values.englishTitle}
          />
          <Input
            label="English Description"
            multiline
            name="englishDescription"
            onBlur={addCategoryFormik.handleBlur}
            onChange={(value) =>
              addCategoryFormik.setFieldValue("englishDescription", value)
            }
            placeholder="RFID-tagged shirts and tops"
            rows={3}
            value={addCategoryFormik.values.englishDescription}
          />
          {/* Arabic title and description fields will be enabled later. */}
          {/*
            <Input name="arabicTitle" label="Arabic Title" />
            <Input name="arabicDescription" label="Arabic Description" multiline />
          */}
        </form>
      </Modal>

      <Modal
        description="Update the English category title and description."
        footer={
          <>
            <Button onClick={closeEditModal} rounded="10px" size="sm" variant="outline">
              Cancel
            </Button>
            <Button
              form="edit-category-form"
              leftIcon={<CircleCheck size={16} />}
              loading={editCategoryFormik.isSubmitting}
              rounded="10px"
              size="sm"
              type="submit"
              variant="success"
            >
              Update Category
            </Button>
          </>
        }
        onClose={closeEditModal}
        open={Boolean(editingCategory)}
        title="Edit Category"
        width={760}
      >
        <form
          className="grid gap-5"
          id="edit-category-form"
          onSubmit={editCategoryFormik.handleSubmit}
        >
          <Input
            error={editCategoryFormik.touched.englishTitle && Boolean(editCategoryFormik.errors.englishTitle)}
            helperText={editCategoryFormik.touched.englishTitle ? editCategoryFormik.errors.englishTitle : ""}
            label="English Title"
            leftIcon={<Tag size={18} />}
            name="englishTitle"
            onBlur={editCategoryFormik.handleBlur}
            onChange={(value) => editCategoryFormik.setFieldValue("englishTitle", value)}
            required
            value={editCategoryFormik.values.englishTitle}
          />
          <Input
            label="English Description"
            multiline
            name="englishDescription"
            onBlur={editCategoryFormik.handleBlur}
            onChange={(value) => editCategoryFormik.setFieldValue("englishDescription", value)}
            rows={3}
            value={editCategoryFormik.values.englishDescription}
          />
          <Dropdown
            label="Status"
            onChange={(value) => editCategoryFormik.setFieldValue("status", value)}
            options={statusOptions.slice(1)}
            value={editCategoryFormik.values.status}
          />
        </form>
      </Modal>
    </>
  );
};

export default Categories;
