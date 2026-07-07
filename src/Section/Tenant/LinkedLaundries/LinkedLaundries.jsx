import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AlertTriangle,
  Building2,
  Eye,
  Mail,
  Plus,
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
import IconWrapper from "../../../Components/UI/IconWrapper";
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
  const [linkedLaundries, setLinkedLaundries] = useState(laundries);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [laundryFilter, setLaundryFilter] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [unlinkLaundry, setUnlinkLaundry] = useState(null);
  const [defaultBlockedLaundry, setDefaultBlockedLaundry] = useState(null);
  const [defaultAction, setDefaultAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const currentDefaultLaundry = linkedLaundries.find(
    (laundry) => laundry.isDefault,
  );
  const isUnlinkModalOpen = Boolean(unlinkLaundry);
  const isDefaultBlockedModalOpen = Boolean(defaultBlockedLaundry);
  const isDefaultConfirmModalOpen = Boolean(defaultAction);

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
    return linkedLaundries.filter((laundry) => {
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
  }, [laundryFilter, linkedLaundries, searchValue, statusFilter]);

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

  const closeUnlinkModal = () => {
    setUnlinkLaundry(null);
  };

  const closeDefaultBlockedModal = () => {
    setDefaultBlockedLaundry(null);
  };

  const closeDefaultConfirmModal = () => {
    setDefaultAction(null);
  };

  const requestDefaultAction = (laundry, action) => {
    if (
      action === "set" &&
      currentDefaultLaundry &&
      currentDefaultLaundry.id !== laundry.id
    ) {
      setDefaultBlockedLaundry(laundry);
      return;
    }

    setDefaultAction({ action, laundry });
  };

  const handleConfirmDefaultAction = () => {
    if (!defaultAction) return;

    const { action, laundry } = defaultAction;

    setLinkedLaundries((current) =>
      current.map((item) =>
        item.id === laundry.id
          ? { ...item, isDefault: action === "set" }
          : item,
      ),
    );
    setDefaultAction(null);
  };

  const handleConfirmUnlink = () => {
    if (!unlinkLaundry) return;

    setLinkedLaundries((current) =>
      current.filter((laundry) => laundry.id !== unlinkLaundry.id),
    );
    setUnlinkLaundry(null);
    resetCurrentPage();
  };

  const columns = [
    {
      key: "name",
      label: "Laundry Name",
      width: "minmax(230px, 1.35fr)",
      render: (_, row) => (
        <div className="flex min-w-0 items-center gap-3">
          <IconWrapper
            icon={Building2}
            variant="info"
            sizeClassName="h-9 w-9 shrink-0"
            roundedClassName="rounded-xl"
            iconSize={17}
          />
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
            onClick={() => requestDefaultAction(row, "set")}
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
              label: row.isDefault ? "Unset Default" : "Set As Default",
              icon: row.isDefault ? StarOff : Star,
              onClick: () =>
                requestDefaultAction(row, row.isDefault ? "unset" : "set"),
            },
            {
              label: "Unlink Laundry",
              icon: Unlink,
              danger: true,
              onClick: () => setUnlinkLaundry(row),
            },
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
          leftIcon={<Plus size={16} />}
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
            <Button onClick={closeInviteModal} size="sm" variant="secondary">
              Cancel
            </Button>
            <Button
              variant="success"
              form="invite-laundry-form"
              leftIcon={<Send size={18} />}
              size="sm"
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

      <Modal
        footer={
          <>
            <Button onClick={closeUnlinkModal} size="sm" variant="secondary">
              Cancel
            </Button>
            <Button
              leftIcon={<Unlink size={18} />}
              onClick={handleConfirmUnlink}
              size="sm"
              variant="danger"
            >
              Unlink Laundry
            </Button>
          </>
        }
        onClose={closeUnlinkModal}
        open={isUnlinkModalOpen}
        title="Unlink Laundry"
        width={520}
      >
        {unlinkLaundry && (
          <div className="space-y-4">
            <Alert
              leftIcon={<AlertTriangle size={18} />}
              rounded="rounded-xl"
              variant="danger"
            >
              <p className="m-0 font-bold">Confirm unlink request</p>
              <p className="m-0 mt-1 text-sm">
                You are about to unlink{" "}
                <span className="font-black">{unlinkLaundry.name}</span> from
                this tenant account.
              </p>
            </Alert>

            <div className="rounded-xl border border-(--theme-border) bg-(--button-ghost-bg) px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-4 py-1">
                <span className="font-semibold text-(--theme-text-muted)">
                  Contact
                </span>
                <span className="text-right font-bold text-(--theme-text-primary)">
                  {unlinkLaundry.contact}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1">
                <span className="font-semibold text-(--theme-text-muted)">
                  Status
                </span>
                <span className="text-right font-bold text-(--theme-text-primary)">
                  {unlinkLaundry.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1">
                <span className="font-semibold text-(--theme-text-muted)">
                  Default
                </span>
                <span className="text-right font-bold text-(--theme-text-primary)">
                  {unlinkLaundry.isDefault ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        footer={
          <>
            <Button
              onClick={closeDefaultConfirmModal}
              size="sm"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              leftIcon={
                defaultAction?.action === "set" ? (
                  <Star size={18} />
                ) : (
                  <StarOff size={18} />
                )
              }
              onClick={handleConfirmDefaultAction}
              size="sm"
              variant={defaultAction?.action === "set" ? "success" : "warning"}
            >
              {defaultAction?.action === "set"
                ? "Set As Default"
                : "Unset Default"}
            </Button>
          </>
        }
        onClose={closeDefaultConfirmModal}
        open={isDefaultConfirmModalOpen}
        title={
          defaultAction?.action === "set"
            ? "Set Default Laundry"
            : "Unset Default Laundry"
        }
        width={520}
      >
        {defaultAction && (
          <Alert
            leftIcon={<AlertTriangle size={18} />}
            rounded="rounded-xl"
            variant="info"
          >
            <p className="m-0 font-bold">
              {defaultAction.action === "set"
                ? "Confirm default laundry"
                : "Confirm unset default"}
            </p>
            <p className="m-0 mt-1 text-sm">
              {defaultAction.action === "set" ? (
                <>
                  Set{" "}
                  <span className="font-black">
                    {defaultAction.laundry.name}
                  </span>{" "}
                  as the default laundry for this tenant.
                </>
              ) : (
                <>
                  Unset{" "}
                  <span className="font-black">
                    {defaultAction.laundry.name}
                  </span>{" "}
                  as the default laundry. No laundry will be default until you
                  set another one.
                </>
              )}
            </p>
          </Alert>
        )}
      </Modal>

      <Modal
        footer={
          <Button onClick={closeDefaultBlockedModal} size="sm" variant="danger">
            Got It
          </Button>
        }
        onClose={closeDefaultBlockedModal}
        open={isDefaultBlockedModalOpen}
        title="Unset Default Laundry First"
        width={500}
      >
        <Alert
          leftIcon={<AlertTriangle size={18} />}
          rounded="rounded-xl"
          variant="danger"
        >
          <p className="m-0 font-bold">Only one laundry can be default.</p>
          <p className="m-0 mt-1 text-sm">
            {currentDefaultLaundry?.name || "Another laundry"} is already set as
            default. Unset it first, then set{" "}
            {defaultBlockedLaundry?.name || "this laundry"} as default.
          </p>
        </Alert>
      </Modal>
    </>
  );
};

export default LinkedLaundries;
