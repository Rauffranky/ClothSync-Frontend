import { useMemo, useState } from "react";
import { CircleCheck, Plus, Search, Tag } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Card from "../../../Components/UI/Card";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import Pagination from "../../../Components/UI/Pagination";
import CategoriesTable from "./CategoriesTable";
import Stats from "./Stats";
import { categories } from "./data";

const ITEMS_PER_PAGE = 5;

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const usageOptions = [
  { label: "All Usage", value: "all" },
  { label: "In Use", value: "used" },
  { label: "Not in Use", value: "unused" },
];

const addCategoryInitialValues = {
  name: "",
  description: "",
};

const addCategoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .required("Category name is required"),
  description: Yup.string().trim(),
});

const Categories = () => {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [usageFilter, setUsageFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !search ||
        [
          category.name,
          category.id,
          category.washLimit,
          category.status,
          category.usage,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesStatus =
        statusFilter === "all" ||
        category.status.toLowerCase() === statusFilter;
      const matchesUsage =
        usageFilter === "all" || category.usageState === usageFilter;

      return matchesSearch && matchesStatus && matchesUsage;
    });
  }, [searchValue, statusFilter, usageFilter]);

  const pageCount = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedCategories = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;

    return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, filteredCategories]);

  const resetCurrentPage = () => {
    setCurrentPage(0);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    resetCurrentPage();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    resetCurrentPage();
  };

  const handleUsageFilterChange = (value) => {
    setUsageFilter(value);
    resetCurrentPage();
  };

  const addCategoryFormik = useFormik({
    initialValues: addCategoryInitialValues,
    validationSchema: addCategoryValidationSchema,
    onSubmit: (_, { resetForm }) => {
      setIsAddModalOpen(false);
      resetForm();
    },
  });

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    addCategoryFormik.resetForm();
  };

  return (
    <>
      <div className="space-y-5">
        <Stats />

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
              onChange={handleUsageFilterChange}
              options={usageOptions}
              value={usageFilter}
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
            <CategoriesTable data={paginatedCategories} />
            <Pagination
              forcePage={activePage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={({ selected }) => setCurrentPage(selected)}
              pageCount={pageCount}
              totalItems={filteredCategories.length}
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
            error={
              addCategoryFormik.touched.name &&
              Boolean(addCategoryFormik.errors.name)
            }
            helperText={
              addCategoryFormik.touched.name
                ? addCategoryFormik.errors.name
                : ""
            }
            label="Category Name"
            leftIcon={<Tag size={18} />}
            name="name"
            onBlur={addCategoryFormik.handleBlur}
            onChange={(value) => addCategoryFormik.setFieldValue("name", value)}
            placeholder="e.g. King Duvet Cover"
            required
            value={addCategoryFormik.values.name}
          />
          <Input
            error={
              addCategoryFormik.touched.description &&
              Boolean(addCategoryFormik.errors.description)
            }
            helperText={
              addCategoryFormik.touched.description
                ? addCategoryFormik.errors.description
                : ""
            }
            label="Description / Notes"
            multiline
            name="description"
            onBlur={addCategoryFormik.handleBlur}
            onChange={(value) =>
              addCategoryFormik.setFieldValue("description", value)
            }
            placeholder="Fabric type, condition, notes..."
            rows={4}
            value={addCategoryFormik.values.description}
          />
        </form>
      </Modal>
    </>
  );
};

export default Categories;
