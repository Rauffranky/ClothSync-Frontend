import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building2,
  Eye,
  Mail,
  Search,
  Send,
  Star,
  StarOff,
  Unlink,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import { laundries } from "./data";

const ITEMS_PER_PAGE = 3;

const filterOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Connected", value: "connected" },
  { label: "Suspended", value: "suspended" },
];

const laundryOptions = [
  { label: "All Laundries", value: "all" },
  { label: "Default Only", value: "default" },
  { label: "Non Default", value: "non-default" },
];

const inviteLaundryInitialValues = {
  email: "",
};

const inviteLaundryValidationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
});

const LinkedLaundries = () => {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const inviteLaundryFormik = useFormik({
    initialValues: inviteLaundryInitialValues,
    validationSchema: inviteLaundryValidationSchema,
    onSubmit: () => {
      closeInviteModal();
    },
  });

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    inviteLaundryFormik.resetForm();
  };

  const filteredLaundries = useMemo(() => {
    return laundries.filter((laundry) => {
      const search = searchValue.trim().toLowerCase();
      const matchesSearch =
        !search ||
        [
          laundry.name,
          laundry.id,
          laundry.contact,
          laundry.email,
          laundry.location,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesStatus =
        statusFilter === "all" || laundry.status.toLowerCase() === statusFilter;
      const matchesLaundry =
        laundryFilter === "all" ||
        (laundryFilter === "default" && laundry.isDefault) ||
        (laundryFilter === "non-default" && !laundry.isDefault);

      return matchesSearch && matchesStatus && matchesLaundry;
    });
  }, [laundryFilter, searchValue, statusFilter]);

  const pageCount = Math.ceil(filteredLaundries.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedLaundries = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;

    return filteredLaundries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, filteredLaundries]);

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

  const handleLaundryFilterChange = (value) => {
    setLaundryFilter(value);
    resetCurrentPage();
  };

  const columns = [
    {
      key: "name",
      label: "Laundry Name",
      width: "minmax(230px, 1.35fr)",
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{
              color: "var(--color-sky-blue)",
              background:
                "color-mix(in srgb, var(--color-sky-blue) 13%, transparent)",
            }}
          >
            <Building2 size={17} />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate  text-(--theme-text-primary)">
              {row.name}
            </p>
            <p className="m-0 mt-0.5 text-xs font-semibold text-(--theme-text-muted)">
              {row.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      width: "minmax(190px, 1fr)",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="m-0 truncate font-bold text-(--theme-text-primary)">
            {row.contact}
          </p>
          <p className="m-0 mt-0.5 truncate text-xs font-semibold text-(--theme-text-muted)">
            {row.email}
          </p>
        </div>
      ),
    },
    { key: "location", label: "Location", width: "150px" },
    {
      key: "status",
      label: "Status",
      width: "130px",
      render: (_, row) => (
        <Badge variant={row.statusVariant} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "isDefault",
      label: "Default",
      width: "135px",
      render: (_, row) =>
        row.isDefault ? (
          <Badge variant="warning" size="sm" leftIcon={<Star size={12} />}>
            Default
          </Badge>
        ) : (
          <Button
            leftIcon={<StarOff size={13} />}
            size={{ minHeight: 28, padding: "0 10px", fontSize: "0.75rem" }}
            variant="ghost"
          >
            Set
          </Button>
        ),
    },
    { key: "batches", label: "Batches", width: "95px", align: "center" },
    { key: "itemsSent", label: "Items Sent", width: "115px", align: "center" },
    {
      key: "missing",
      label: "Missing",
      width: "95px",
      align: "center",
      render: (value) => (
        <span
          className="font-black"
          style={{
            color:
              value > 0 ? "var(--color-overdue)" : "var(--theme-text-muted)",
          }}
        >
          {value > 0 ? value : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "110px",
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          items={[
            { label: "View Details", icon: Eye },
            {
              label: "Set As Default",
              icon: Star,
              disabled: row.isDefault,
            },
            { label: "Unlink Laundry", icon: Unlink, danger: true },
          ]}
          width={200}
        />
      ),
    },
  ];

  return (
    <>
      <div className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(240px,1fr)_170px_190px_auto]">
        <Input
          // height="42px"
          leftIcon={<Search size={16} />}
          onChange={handleSearchChange}
          placeholder="Search laundries..."
          value={searchValue}
        />
        <Dropdown
          onChange={handleStatusFilterChange}
          options={filterOptions}
          value={statusFilter}
        />
        <Dropdown
          onChange={handleLaundryFilterChange}
          options={laundryOptions}
          value={laundryFilter}
        />
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          variant="secondary"
          size="sm"
        >
          Invite New Laundry
        </Button>
      </div>

      <div className="px-4 pb-4">
        <Table
          columns={columns}
          data={paginatedLaundries}
          emptyText="No linked laundries found"
          rowKey="id"
        />
        <Pagination
          forcePage={activePage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          pageCount={pageCount}
          totalItems={filteredLaundries.length}
        />
      </div>

      <Modal
        description="Send an invitation to a laundry company to join ClothSync."
        footer={
          <>
            <Button
              onClick={closeInviteModal}
              rounded="12px"
              size="md"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              form="invite-laundry-form"
              leftIcon={<Send size={18} />}
              rounded="12px"
              size="md"
              type="submit"
            >
              Send Invitation
            </Button>
          </>
        }
        onClose={closeInviteModal}
        open={isInviteModalOpen}
        title="Invite New Laundry"
      >
        <form
          className="space-y-5"
          id="invite-laundry-form"
          onSubmit={inviteLaundryFormik.handleSubmit}
        >
          <Input
            error={
              inviteLaundryFormik.touched.email &&
              Boolean(inviteLaundryFormik.errors.email)
            }
            helperText={
              inviteLaundryFormik.touched.email
                ? inviteLaundryFormik.errors.email
                : ""
            }
            label="Email Address"
            leftIcon={<Mail size={20} />}
            name="email"
            onBlur={inviteLaundryFormik.handleBlur}
            onChange={(value) =>
              inviteLaundryFormik.setFieldValue("email", value)
            }
            placeholder="contact@laundry.com"
            required
            type="email"
            value={inviteLaundryFormik.values.email}
          />

          <Alert variant="info">
            An email invitation will be sent to the contact. Once they accept,
            they'll appear in your Linked Laundries list.
          </Alert>
        </form>
      </Modal>
    </>
  );
};

export default LinkedLaundries;
