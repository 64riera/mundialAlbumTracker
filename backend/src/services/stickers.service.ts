import { db } from "../lib/db";
import { AppError } from "../middleware/errorHandler";

type StatusFilter = "all" | "owned" | "missing" | "duplicate";

export async function getStickers(status: StatusFilter = "all") {
  const stickers = await db.sticker.findMany({
    orderBy: { number: "asc" },
    include: {
      userSticker: true,
      section: { select: { code: true, name: true, flagEmoji: true } },
    },
  });

  const mapped = stickers.map((s) => ({
    id: s.id,
    number: s.number,
    code: s.code,
    name: s.name,
    type: s.type,
    isShiny: s.isShiny,
    quantity: s.userSticker?.quantity ?? 0,
    section: s.section,
  }));

  if (status === "owned") return mapped.filter((s) => s.quantity === 1);
  if (status === "missing") return mapped.filter((s) => s.quantity === 0);
  if (status === "duplicate") return mapped.filter((s) => s.quantity >= 2);
  return mapped;
}

export async function getStickerByNumber(number: number) {
  const sticker = await db.sticker.findUnique({
    where: { number },
    include: {
      userSticker: true,
      section: true,
    },
  });

  if (!sticker) throw new AppError(404, `Sticker #${number} no encontrado`);

  return {
    id: sticker.id,
    number: sticker.number,
    code: sticker.code,
    name: sticker.name,
    type: sticker.type,
    isShiny: sticker.isShiny,
    quantity: sticker.userSticker?.quantity ?? 0,
    section: sticker.section,
  };
}

export async function searchStickers(query: string) {
  const q = query.trim();
  if (!q) return [];

  const results = await db.sticker.findMany({
    where: {
      OR: [
        { code: { startsWith: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      userSticker: true,
      section: { select: { code: true, name: true, flagEmoji: true } },
    },
    orderBy: { code: "asc" },
    take: 15,
  });

  return results.map((s) => ({
    id: s.id,
    number: s.number,
    code: s.code,
    name: s.name,
    type: s.type,
    isShiny: s.isShiny,
    quantity: s.userSticker?.quantity ?? 0,
    section: s.section,
  }));
}

export async function updateQuantity(number: number, quantity: number) {
  const sticker = await db.sticker.findUnique({ where: { number } });
  if (!sticker) throw new AppError(404, `Sticker #${number} no encontrado`);

  return db.userSticker.upsert({
    where: { stickerId: sticker.id },
    update: { quantity },
    create: { stickerId: sticker.id, quantity },
  });
}

export async function bulkCollect(numbers: number[]) {
  const stickers = await db.sticker.findMany({
    where: { number: { in: numbers } },
    include: { userSticker: true },
  });

  const updates = await Promise.all(
    stickers.map((sticker) =>
      db.userSticker.upsert({
        where: { stickerId: sticker.id },
        update: { quantity: { increment: 1 } },
        create: { stickerId: sticker.id, quantity: 1 },
      })
    )
  );

  return {
    updated: updates.length,
    notFound: numbers.filter((n) => !stickers.find((s) => s.number === n)),
  };
}

export async function bulkCollectByCodes(codes: string[]) {
  const stickers = await db.sticker.findMany({
    where: { code: { in: codes } },
    include: { userSticker: true },
  });

  const updates = await Promise.all(
    stickers.map((sticker) =>
      db.userSticker.upsert({
        where: { stickerId: sticker.id },
        update: { quantity: { increment: 1 } },
        create: { stickerId: sticker.id, quantity: 1 },
      })
    )
  );

  return {
    updated: updates.length,
    notFound: codes.filter((c) => !stickers.find((s) => s.code === c)),
  };
}
