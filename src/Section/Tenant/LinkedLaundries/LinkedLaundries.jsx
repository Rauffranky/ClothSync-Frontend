import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building2,
  Eye,
  Plus,
  Search,
  Star,
  StarOff,
  Unlink,
} from "lucide-react";
import ActionDropdown from "../../../Components/UI/ActionDropdown";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Pagination from "../../../Components/UI/Pagination";
import Table from "../../../Components/UI/Table";
import IconWrapper from "../../../Components/UI/IconWrapper";
import { useSortableTableData } from "../../../Hooks/useSortableTableData";
import { laundries } from "./data";
import InviteLaundryModal from "./InviteLaundryModal";
import UnlinkLaundryModal from "./UnlinkLaundryModal";
import DefaultConfirmModal from "./DefaultConfirmModal";
import DefaultBlockedModal from "./DefaultBlockedModal";

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

  const { handleSort, sortedData, sortBy, sortDirection } =
    useSortableTableData(filteredLaundries);
  const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const activePage = pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
  const paginatedLaundries = useMemo(() => {
    const startIndex = activePage * ITEMS_PER_PAGE;

    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, sortedData]);

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

  const handleTableSort = (nextSortBy, nextSortDirection) => {
    handleSort(nextSortBy, nextSortDirection);
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
    if (laundry.status === "Suspended") return;

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
    const isConnecting = unlinkLaundry.status === "Suspended";

    setLinkedLaundries((current) =>
      current.map((laundry) =>
        laundry.id === unlinkLaundry.id
          ? {
              ...laundry,
              status: isConnecting ? "Connected" : "Suspended",
              statusVariant: isConnecting ? "success" : "neutral",
              isDefault: false,
            }
          : laundry,
      ),
    );
    setUnlinkLaundry(null);
    resetCurrentPage();
  };

  const columns = [
    {
      key: "name",
      label: "Laundry Name",
      sortable: true,
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
      sortable: true,
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
    { key: "location", label: "Location", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, row) => (
        <Badge variant={row.statusVariant} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "isDefault",
      label: "Default",
      sortable: true,
      render: (_, row) =>
        row.isDefault ? (
          <Badge variant="warning" size="sm" leftIcon={<Star size={12} />}>
            Default
          </Badge>
        ) : row.status === "Suspended" ? (
          <span className="font-black text-(--theme-text-muted)">-</span>
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
    { key: "batches", label: "Batches", align: "center", sortable: true },
    { key: "itemsSent", label: "Items Sent", align: "center", sortable: true },
    {
      key: "missing",
      label: "Missing",
      align: "center",
      sortable: true,
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
      align: "center",
      render: (_, row) => (
        <ActionDropdown
          items={[
            { label: "View Details", icon: Eye },
            ...(row.status === "Suspended"
              ? []
              : [
                  {
                    label: row.isDefault ? "Unset Default" : "Set As Default",
                    icon: row.isDefault ? StarOff : Star,
                    onClick: () =>
                      requestDefaultAction(
                        row,
                        row.isDefault ? "unset" : "set",
                      ),
                  },
                ]),
            {
              label:
                row.status === "Suspended"
                  ? "Connect Laundry"
                  : "Unlink Laundry",
              icon: row.status === "Suspended" ? Building2 : Unlink,
              danger: row.status !== "Suspended",
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
          onSort={handleTableSort}
          rowKey="id"
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
        <Pagination
          forcePage={activePage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          pageCount={pageCount}
          totalItems={sortedData.length}
        />
      </div>

      <InviteLaundryModal
        isOpen={isInviteModalOpen}
        onClose={closeInviteModal}
        formik={inviteLaundryFormik}
      />

      <UnlinkLaundryModal
        isOpen={Boolean(unlinkLaundry)}
        onClose={closeUnlinkModal}
        laundry={unlinkLaundry}
        onConfirm={handleConfirmUnlink}
      />

      <DefaultConfirmModal
        isOpen={Boolean(defaultAction)}
        onClose={closeDefaultConfirmModal}
        actionData={defaultAction}
        onConfirm={handleConfirmDefaultAction}
      />

      <DefaultBlockedModal
        isOpen={Boolean(defaultBlockedLaundry)}
        onClose={closeDefaultBlockedModal}
        blockedLaundry={defaultBlockedLaundry}
        currentDefaultLaundry={currentDefaultLaundry}
      />
    </>
  );
};

export default LinkedLaundries;
