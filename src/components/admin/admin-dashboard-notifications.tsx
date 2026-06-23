"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react";

type AdminDashboardNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  action: string;
  tone: string;
};

type AdminDashboardNotificationsProps = {
  initialNotifications: AdminDashboardNotification[];
  locale: string;
  query?: string;
};

const notificationStyles = {
  green: {
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-600",
    borderClass: "border-green-100",
  },
  red: {
    icon: AlertTriangle,
    iconClass: "bg-red-100 text-red-600",
    borderClass: "border-red-100",
  },
  yellow: {
    icon: Bell,
    iconClass: "bg-yellow-100 text-yellow-700",
    borderClass: "border-yellow-100",
  },
};

const REFRESH_INTERVAL_MS = 15000;
const MIN_REFRESH_GAP_MS = 1500;
const REFRESH_CHANNEL = "admin-dashboard-notifications";
const REFRESH_STORAGE_KEY = "admin-dashboard-notifications-refreshed-at";

export function AdminDashboardNotifications({
  initialNotifications,
  locale,
  query = "",
}: AdminDashboardNotificationsProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const isRefreshingRef = useRef(false);
  const lastRefreshRef = useRef(0);

  const refreshNotifications = useCallback(async () => {
    const now = Date.now();

    if (
      isRefreshingRef.current ||
      now - lastRefreshRef.current < MIN_REFRESH_GAP_MS
    ) {
      return;
    }

    isRefreshingRef.current = true;
    lastRefreshRef.current = now;

    try {
      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        notifications?: AdminDashboardNotification[];
      };

      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);

        try {
          window.localStorage.setItem(REFRESH_STORAGE_KEY, String(Date.now()));
        } catch {
          // localStorage can be unavailable in private or restricted contexts.
        }
      }
    } catch {
      // Keep the server-rendered notifications if the live refresh is unavailable.
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    refreshNotifications();

    let channel: BroadcastChannel | null = null;
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        refreshNotifications();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNotifications();
      }
    };
    const handleFocus = () => refreshNotifications();
    const handleOnline = () => refreshNotifications();
    const handlePageShow = () => refreshNotifications();
    const handlePointerDown = () => refreshIfVisible();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === REFRESH_STORAGE_KEY) {
        refreshIfVisible();
      }
    };

    const intervalId = window.setInterval(refreshIfVisible, REFRESH_INTERVAL_MS);

    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(REFRESH_CHANNEL);
      channel.onmessage = () => refreshIfVisible();
      channel.postMessage({ type: "mounted" });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(intervalId);
      channel?.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshNotifications]);

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return notifications;
    }

    return notifications.filter((notification) =>
      [notification.title, notification.body, notification.action]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [notifications, query]);

  return (
    <div className="space-y-3">
      {filteredNotifications.map((notification) => {
        const style =
          notificationStyles[
            notification.tone as keyof typeof notificationStyles
          ] || notificationStyles.yellow;
        const Icon = style.icon;

        return (
          <div
            key={notification.id}
            className={`min-w-0 rounded-2xl border ${style.borderClass} bg-gray-50/60 p-4`}
          >
            <div className="flex min-w-0 gap-3">
              <div className={`h-fit rounded-xl p-2 ${style.iconClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="break-words font-bold text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-gray-500">
                  {notification.body}
                </p>
                <Link
                  href={`/${locale}${notification.href}`}
                  className="mt-3 inline-flex max-w-full items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                >
                  <span className="truncate">{notification.action}</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No notifications matched your search.
        </div>
      ) : null}
    </div>
  );
}
