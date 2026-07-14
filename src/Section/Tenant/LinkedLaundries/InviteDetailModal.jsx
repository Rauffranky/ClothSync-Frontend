import { useEffect, useState } from "react";
import { Mail, Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Badge from "../../../Components/UI/Badge";
import { getTenantLaundryInviteDetails } from "../../../axios/laundries/tenantLaundries";
import { getApiErrorMessage } from "../../../axios/api";
import { formatDateWithUserPreferences } from "../../../Utils/date";

const InviteDetailModal = ({ isOpen, onClose, request }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && request) {
      // If token exists, fetch from API. Otherwise, we can just show the row data.
      if (request.token) {
        setIsLoading(true);
        setError(null);
        getTenantLaundryInviteDetails(request.token)
          .then((response) => {
            setDetails(response?.data?.invite || null);
          })
          .catch((err) => {
            setError(getApiErrorMessage(err, "Failed to load invite details"));
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Fallback to row data if token is not available
        setDetails(request);
      }
    } else {
      setDetails(null);
      setError(null);
    }
  }, [isOpen, request]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
      case "expired":
        return "danger";
      case "pending":
      default:
        return "neutral";
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Invitation Details">
      <div className="p-6">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <span className="text-(--theme-text-muted)">Loading details...</span>
          </div>
        ) : error ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-red-500">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        ) : details ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-(--theme-border) p-4">
                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                  <Mail size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Email</span>
                </div>
                <p className="mt-2 font-semibold text-(--theme-text-primary)">
                  {details.email}
                </p>
              </div>

              <div className="rounded-xl border border-(--theme-border) p-4">
                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Status</span>
                </div>
                <div className="mt-2">
                  <Badge variant={getStatusVariant(details.status)}>
                    {details.status}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-(--theme-border) p-4 sm:col-span-2">
                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                  <Calendar size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Expires At</span>
                </div>
                <p className="mt-2 font-semibold text-(--theme-text-primary)">
                  {details.expiresAt ? formatDateWithUserPreferences(details.expiresAt) : "-"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center">
            <span className="text-(--theme-text-muted)">No details found</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end border-t border-(--theme-border) p-4">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default InviteDetailModal;
