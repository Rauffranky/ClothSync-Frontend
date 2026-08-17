import { useEffect, useState, useCallback } from "react";
import {
  getActiveBulkScanUndoNotices,
  setActiveBulkScanUndoNotices,
} from "../Utils/bulkScanSession";

export const mergeUndoNotices = (current, incoming) => {
  const byId = new Map(current.map((notice) => [notice.id, notice]));
  incoming.forEach((notice) => byId.set(notice.id, notice));
  return [...byId.values()];
};

const useGlobalUndoNotices = () => {
  const [notices, setNotices] = useState(getActiveBulkScanUndoNotices);

  useEffect(() => {
    const handleStorageChange = () => {
      setNotices(getActiveBulkScanUndoNotices());
    };

    window.addEventListener("bulk-scan-undo-notices-changed", handleStorageChange);
    // Also listen to storage events across tabs
    const handleCrossTabStorage = (e) => {
      if (e.key === "active-tenant-bulk-scan-undo-notices") {
        handleStorageChange();
      }
    };
    window.addEventListener("storage", handleCrossTabStorage);

    return () => {
      window.removeEventListener("bulk-scan-undo-notices-changed", handleStorageChange);
      window.removeEventListener("storage", handleCrossTabStorage);
    };
  }, []);

  const updateNotices = useCallback((newNoticesOrUpdater) => {
    const nextNotices =
      typeof newNoticesOrUpdater === "function"
        ? newNoticesOrUpdater(getActiveBulkScanUndoNotices())
        : newNoticesOrUpdater;
    setActiveBulkScanUndoNotices(nextNotices);
  }, []);

  return [notices, updateNotices];
};

export default useGlobalUndoNotices;
