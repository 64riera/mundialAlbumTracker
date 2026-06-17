import webPush from "web-push";
import { db } from "../lib/db";
import { env } from "../lib/env";
import type { Match } from "./matches.service";

let configured = false;

export function initWebPush(): boolean {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured — push notifications disabled");
    return false;
  }

  webPush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  configured = true;
  return true;
}

export function isWebPushConfigured(): boolean {
  return configured;
}

// --- Subscription management ---

interface SubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function subscribe(userId: string, sub: SubscriptionInput) {
  await db.notificationPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    create: {
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  });
}

export async function unsubscribe(userId: string, endpoint: string) {
  return db.pushSubscription.deleteMany({ where: { userId, endpoint } });
}

export async function getSubscriptionCount(userId: string): Promise<number> {
  return db.pushSubscription.count({ where: { userId } });
}

// --- Preferences ---

export async function getPreferences(userId: string) {
  return db.notificationPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function updatePreferences(
  userId: string,
  data: { matchStart?: boolean; goals?: boolean; lang?: string }
) {
  return db.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

// --- Sending ---

async function sendToSubscription(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: string
): Promise<boolean> {
  try {
    await webPush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) {
      await db.pushSubscription
        .delete({ where: { endpoint: sub.endpoint } })
        .catch(() => {});
    }
    return false;
  }
}

function buildPayload(
  type: "matchStart" | "goal",
  match: Match,
  lang: string
) {
  const es = lang === "es";
  const home = match.homeTeam.shortName;
  const away = match.awayTeam.shortName;

  if (type === "matchStart") {
    return {
      title: es ? "Partido iniciado" : "Match started",
      body: `${home} vs ${away}`,
      tag: `match-start-${match.id}`,
      data: { url: "/matches" },
    };
  }

  const hs = match.score.fullTime.home ?? 0;
  const as_ = match.score.fullTime.away ?? 0;
  return {
    title: es ? "GOL!" : "GOAL!",
    body: `${home} ${hs} - ${as_} ${away}`,
    tag: `goal-${match.id}-${hs}-${as_}`,
    data: { url: "/matches" },
  };
}

async function broadcast(
  preferenceField: "matchStart" | "goals",
  type: "matchStart" | "goal",
  match: Match
) {
  if (!configured) return;

  const subscriptions = await db.pushSubscription.findMany({
    where: {
      user: { notificationPreference: { [preferenceField]: true } },
    },
    include: {
      user: { include: { notificationPreference: true } },
    },
  });

  const sends = subscriptions.map((sub) => {
    const lang = sub.user.notificationPreference?.lang ?? "es";
    const payload = buildPayload(type, match, lang);
    return sendToSubscription(sub, JSON.stringify(payload));
  });

  await Promise.allSettled(sends);
}

export function broadcastMatchStart(match: Match) {
  return broadcast("matchStart", "matchStart", match);
}

export function broadcastGoal(match: Match) {
  return broadcast("goals", "goal", match);
}
