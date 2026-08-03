export const formatStatusLabel = (status, fallback = "-") => {
  if (status === null || status === undefined) return fallback;

  const label = String(status)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (!label) return fallback;

  return label.replace(/\b\w/g, (character) => character.toUpperCase());
};
