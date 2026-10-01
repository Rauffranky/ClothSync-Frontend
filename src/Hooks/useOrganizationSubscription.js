import { useState, useEffect, useCallback } from "react";
import { getMySubscription } from "../axios/subscriptions/subscriptions";
import { getAuthSessionUser, AUTH_SESSION_CHANGED_EVENT } from "../axios/auth/authSession";

export const SUBSCRIPTION_UPDATED_EVENT = "clothsync-subscription-updated";

export const notifySubscriptionUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SUBSCRIPTION_UPDATED_EVENT));
  }
};

export const useOrganizationSubscription = () => {
  const user = getAuthSessionUser();
  const isSuperAdmin =
    user?.role === "super_admin" ||
    user?.roleName?.toLowerCase().includes("super");

  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(!isSuperAdmin);
  const [error, setError] = useState(null);

  const reloadSubscription = useCallback(async () => {
    if (isSuperAdmin) return;
    try {
      const res = await getMySubscription();
      const data = res?.data?.data || res?.data || {};
      setSubscriptionData(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) return;

    let isActive = true;

    getMySubscription()
      .then((res) => {
        if (!isActive) return;
        const data = res?.data?.data || res?.data || {};
        setSubscriptionData(data);
        setError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err);
        setSubscriptionData(null);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    const handleUpdate = () => {
      getMySubscription()
        .then((res) => {
          if (!isActive) return;
          const data = res?.data?.data || res?.data || {};
          setSubscriptionData(data);
          setError(null);
        })
        .catch((err) => {
          if (!isActive) return;
          setError(err);
        });
    };

    window.addEventListener(SUBSCRIPTION_UPDATED_EVENT, handleUpdate);
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleUpdate);

    return () => {
      isActive = false;
      window.removeEventListener(SUBSCRIPTION_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleUpdate);
    };
  }, [isSuperAdmin]);

  if (isSuperAdmin) {
    return {
      subscription: null,
      plan: null,
      hasActiveSubscription: true,
      isPending: false,
      isRejected: false,
      isSuperAdmin: true,
      isLoading: false,
      error: null,
      refreshSubscription: reloadSubscription,
    };
  }

  const sub = subscriptionData?.subscription;
  const status = sub?.status?.toLowerCase();
  const hasActiveSubscription = status === "active";
  const isPending = status === "pending";
  const isRejected = status === "rejected";

  return {
    subscription: sub || null,
    plan: subscriptionData?.plan || sub?.plan || null,
    hasActiveSubscription,
    isPending,
    isRejected,
    isSuperAdmin: false,
    isLoading,
    error,
    refreshSubscription: reloadSubscription,
  };
};

export default useOrganizationSubscription;
