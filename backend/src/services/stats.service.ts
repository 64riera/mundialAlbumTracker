import { db } from "../lib/db";

export async function getOverview() {
  const [total, userStickers] = await Promise.all([
    db.sticker.count(),
    db.userSticker.findMany(),
  ]);

  const owned = userStickers.filter((s) => s.quantity === 1).length;
  const duplicate = userStickers.filter((s) => s.quantity >= 2).length;
  const missing = total - owned - duplicate;

  return {
    total,
    owned,
    duplicate,
    missing,
    percentage: total > 0 ? Math.round(((owned + duplicate) / total) * 100) : 0,
  };
}

export async function getBySection() {
  const sections = await db.section.findMany({
    orderBy: { order: "asc" },
    include: {
      stickers: {
        include: { userSticker: true },
      },
    },
  });

  return sections.map((section) => {
    const total = section.stickers.length;
    const owned = section.stickers.filter(
      (s) => (s.userSticker?.quantity ?? 0) >= 1
    ).length;

    return {
      code: section.code,
      name: section.name,
      flagEmoji: section.flagEmoji,
      confederation: section.confederation,
      type: section.type,
      total,
      owned,
      percentage: total > 0 ? Math.round((owned / total) * 100) : 0,
    };
  });
}

export async function getDuplicates() {
  const stickers = await db.sticker.findMany({
    where: {
      userSticker: { quantity: { gte: 2 } },
    },
    include: {
      userSticker: true,
      section: { select: { code: true, name: true, flagEmoji: true } },
    },
    orderBy: { number: "asc" },
  });

  return stickers.map((s) => ({
    id: s.id,
    number: s.number,
    name: s.name,
    type: s.type,
    quantity: s.userSticker!.quantity,
    section: s.section,
  }));
}
