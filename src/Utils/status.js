const STATUS_LABELS = Object.freeze({
  in_business: "In Business",
  sent_to_laundry: "Sent to Laundry",
  at_laundry: "In Laundry",
  washed: "Washed",
  returned: "Returned",
  delayed: "Delayed",
  missing: "Missing",
  retired: "Retired",
  inactive: "Inactive",
});

export const formatStatusLabel = (status, fallback = "-") => {
  if (status === null || status === undefined) return fallback;

  const statusKey = String(status).trim().toLowerCase();
  if (STATUS_LABELS[statusKey]) return STATUS_LABELS[statusKey];

  const label = String(status)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (!label) return fallback;

  return label.replace(/\b\w/g, (character) => character.toUpperCase());
};
