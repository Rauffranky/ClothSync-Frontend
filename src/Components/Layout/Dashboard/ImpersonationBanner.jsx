import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Button from "../../UI/Button";
import {
  AUTH_SESSION_CHANGED_EVENT,
  exitImpersonation,
  getAuthSessionUser,
  isImpersonating,
} from "../../../axios/auth/authSession";
import { connectSocket } from "../../../socket/client";
import { toast } from "../../../Utils/toast";

const ImpersonationBanner = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(isImpersonating);
  const [user, setUser] = useState(getAuthSessionUser);

  useEffect(() => {
    const handleSessionChange = () => {
      setActive(isImpersonating());
      setUser(getAuthSessionUser());
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    };
  }, []);

  if (!active) return null;

  const displayName =
    user?.businessName ||
    user?.companyName ||
    user?.fullName ||
    user?.name ||
    "User";

  const handleReturn = () => {
    const returnPath = exitImpersonation();
    connectSocket();
    toast.success("Returned to Super Admin session");
    navigate(returnPath || "/superadmin/businesses");
  };

  return (
    <div
      role="region"
      aria-label="Super Admin Impersonation Notice"
      className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-(--badge-pending-border) bg-(--color-pending-bg) px-4 py-2 backdrop-blur-md transition-all"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-(--color-pending)/15 text-(--badge-pending-text)">
          <ShieldAlert size={16} />
        </span>
        <div className="min-w-0 text-xs sm:text-sm">
          <span className="font-bold text-(--badge-pending-text)">
            Super Admin Access:
          </span>{" "}
          <span className="font-semibold text-(--theme-text-primary)">
            Viewing as <span className="underline decoration-(--color-pending)/50 underline-offset-2">{displayName}</span>
          </span>
          {user?.email && (
            <span className="hidden text-xs text-(--theme-text-muted) sm:inline sm:ml-1.5">
              ({user.email})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          leftIcon={<ArrowLeft size={14} />}
          onClick={handleReturn}
          rounded="10px"
          size="xs"
          variant="danger"
        >
          Return to Super Admin
        </Button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
