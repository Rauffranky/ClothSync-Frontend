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
  const readNotices = () => getActiveBulkScanUndoNotices().filter((notice) =>
    Number(notice?.processedTagCount ?? notice?.processedCount ?? notice?.tagCount ?? 0) > 0
  );
  const [notices, setNotices] = useState(readNotices);

  useEffect(() => {
    const handleStorageChange = () => {
      setNotices(readNotices());
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
        ? newNoticesOrUpdater(readNotices())
        : newNoticesOrUpdater;
    setActiveBulkScanUndoNotices(nextNotices.filter((notice) =>
      Number(notice?.processedTagCount ?? notice?.processedCount ?? notice?.tagCount ?? 0) > 0
    ));
  }, []);

  return [notices, updateNotices];
};

export default useGlobalUndoNotices;
