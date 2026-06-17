import { db } from "../lib/db";

export async function getAllSections(userId: string) {
  const sections = await db.section.findMany({
    orderBy: { order: "asc" },
    include: {
      stickers: {
        include: {
          userStickers: { where: { userId } },
        },
      },
    },
  });

  return sections.map((section) => {
    const total = section.stickers.length;
    const owned = section.stickers.filter(
      (s) => (s.userStickers[0]?.quantity ?? 0) >= 1
    ).length;

    return {
      id: section.id,
      code: section.code,
      name: section.name,
      type: section.type,
      flagEmoji: section.flagEmoji,
      confederation: section.confederation,
      order: section.order,
      total,
      owned,
      percentage: total > 0 ? Math.round((owned / total) * 100) : 0,
    };
  });
}

export async function getSectionByCode(code: string, userId: string) {
  const section = await db.section.findUnique({
    where: { code },
    include: {
      stickers: {
        orderBy: { number: "asc" },
        include: {
          userStickers: { where: { userId } },
        },
      },
    },
  });

  if (!section) return null;

  const stickers = section.stickers.map((s) => ({
    id: s.id,
    number: s.number,
    code: s.code,
    name: s.name,
    type: s.type,
    isShiny: s.isShiny,
    quantity: s.userStickers[0]?.quantity ?? 0,
  }));

  const total = stickers.length;
  const owned = stickers.filter((s) => s.quantity >= 1).length;

  return {
    id: section.id,
    code: section.code,
    name: section.name,
    type: section.type,
    flagEmoji: section.flagEmoji,
    confederation: section.confederation,
    total,
    owned,
    percentage: total > 0 ? Math.round((owned / total) * 100) : 0,
    stickers,
  };
}
