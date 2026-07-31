export const SOCKET_EVENTS = Object.freeze({
  CONNECTED: "socket.connected",
  SCANNER_SCAN_BULK: "scanner.scan.bulk",

  SCAN_SESSION_STARTED: "scan.session.started",
  SCAN_SESSION_UPDATED: "scan.session.updated",
  SCAN_SESSION_FINISHED: "scan.session.finished",
  SCAN_SESSION_CLEARED: "scan.session.cleared",
  SCAN_ENTRIES_UPDATED: "scan.entries.updated",

  SCAN_BULK_ADDED: "scan.bulk-added",
  SCAN_BULK_ADD_UNDONE: "scan.bulk-add.undone",
  SCAN_BULK_ADD_EXPIRED: "scan.bulk-add.expired",

  DISPATCH_BATCH_CREATED: "dispatch.batch.created",
  DISPATCH_BATCH_UPDATED: "dispatch.batch.updated",
  DISPATCH_BATCH_ITEM_UPDATED: "dispatch.batch.item.updated",
  DISPATCH_BATCH_COMPLETED: "dispatch.batch.completed",

  DISPATCH_EXCEPTION_CREATED: "dispatch.exception.created",
  DISPATCH_EXCEPTION_RESOLVED: "dispatch.exception.resolved",
});

export const SOCKET_EVENT_GROUPS = Object.freeze({
  SCAN_SESSION: Object.freeze([
    SOCKET_EVENTS.SCAN_SESSION_STARTED,
    SOCKET_EVENTS.SCAN_SESSION_UPDATED,
    SOCKET_EVENTS.SCAN_SESSION_FINISHED,
    SOCKET_EVENTS.SCAN_SESSION_CLEARED,
  ]),
  DISPATCH_BATCHES: Object.freeze([
    SOCKET_EVENTS.DISPATCH_BATCH_CREATED,
    SOCKET_EVENTS.DISPATCH_BATCH_UPDATED,
    SOCKET_EVENTS.DISPATCH_BATCH_COMPLETED,
  ]),
  DISPATCH_EXCEPTIONS: Object.freeze([
    SOCKET_EVENTS.DISPATCH_EXCEPTION_CREATED,
    SOCKET_EVENTS.DISPATCH_EXCEPTION_RESOLVED,
  ]),
});
