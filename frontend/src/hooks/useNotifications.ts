import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLangStore } from "@/lib/i18n";

interface NotificationPreferences {
  matchStart: boolean;
  goals: boolean;
  lang: string;
  subscribed: boolean;
}

const isSupported =
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

async function getVapidKey(): Promise<string | null> {
  try {
    const { data } = await api.get("/api/notifications/vapid-key");
    return data.vapidPublicKey ?? null;
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) array[i] = raw.charCodeAt(i);
  return array;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : "denied"
  );
  const qc = useQueryClient();
  const lang = useLangStore((s) => s.lang);

  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["notification-preferences"],
    queryFn: () => api.get("/api/notifications/preferences").then((r) => r.data),
    staleTime: 60_000,
    enabled: isSupported,
  });

  useEffect(() => {
    if (!isSupported) return;
    const check = () => setPermission(Notification.permission);
    check();
    const id = setInterval(check, 5_000);
    return () => clearInterval(id);
  }, []);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") throw new Error("Permission denied");

      const vapidKey = await getVapidKey();
      if (!vapidKey) throw new Error("VAPID key not available");

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      await api.post("/api/notifications/subscribe", sub.toJSON());
      await api.patch("/api/notifications/preferences", { lang });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.post("/api/notifications/unsubscribe", {
          endpoint: sub.endpoint,
        });
        await sub.unsubscribe();
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });

  const updatePrefs = useMutation({
    mutationFn: (data: { matchStart?: boolean; goals?: boolean }) =>
      api.patch("/api/notifications/preferences", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });

  const subscribe = useCallback(
    () => subscribeMutation.mutateAsync(),
    [subscribeMutation]
  );

  const unsubscribe = useCallback(
    () => unsubscribeMutation.mutateAsync(),
    [unsubscribeMutation]
  );

  return {
    isSupported,
    permission,
    isSubscribed: preferences?.subscribed ?? false,
    preferences: preferences ?? { matchStart: true, goals: true, lang: "es", subscribed: false },
    subscribe,
    unsubscribe,
    updatePrefs: updatePrefs.mutate,
    isLoading: subscribeMutation.isPending || unsubscribeMutation.isPending,
  };
}
