import { db } from "../lib/db";
import { AppError } from "../middleware/errorHandler";

type StatusFilter = "all" | "owned" | "missing" | "duplicate";

function mapSticker(s: {
  id: string;
  number: number;
  code: string;
  name: string;
  type: string;
  isShiny: boolean;
  userStickers: { quantity: number }[];
  section: { code: string; name: string; flagEmoji: string | null };
}) {
  return {
    id: s.id,
    number: s.number,
    code: s.code,
    name: s.name,
    type: s.type,
    isShiny: s.isShiny,
    quantity: s.userStickers[0]?.quantity ?? 0,
    section: s.section,
  };
}

export async function getStickers(userId: string, status: StatusFilter = "all") {
  const stickers = await db.sticker.findMany({
    orderBy: { number: "asc" },
    include: {
      userStickers: { where: { userId } },
      section: { select: { code: true, name: true, flagEmoji: true } },
    },
  });

  const mapped = stickers.map(mapSticker);

  if (status === "owned") return mapped.filter((s) => s.quantity === 1);
  if (status === "missing") return mapped.filter((s) => s.quantity === 0);
  if (status === "duplicate") return mapped.filter((s) => s.quantity >= 2);
  return mapped;
}

export async function getStickerByNumber(number: number, userId: string) {
  const sticker = await db.sticker.findUnique({
    where: { number },
    include: {
      userStickers: { where: { userId } },
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
    quantity: sticker.userStickers[0]?.quantity ?? 0,
    section: sticker.section,
  };
}

function normalizeQuery(raw: string): string {
  return raw.trim().replace(/^([A-Za-z]+)\s*(\d+)$/, "$1-$2");
}

export async function searchStickers(query: string, userId: string) {
  const q = normalizeQuery(query);
  if (!q) return [];

  const results = await db.sticker.findMany({
    where: {
      OR: [
        { code: { startsWith: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      userStickers: { where: { userId } },
      section: { select: { code: true, name: true, flagEmoji: true } },
    },
    orderBy: { code: "asc" },
    take: 15,
  });

  return results.map(mapSticker);
}

export async function updateQuantity(number: number, quantity: number, userId: string) {
  const sticker = await db.sticker.findUnique({ where: { number } });
  if (!sticker) throw new AppError(404, `Sticker #${number} no encontrado`);

  return db.userSticker.upsert({
    where: { userId_stickerId: { userId, stickerId: sticker.id } },
    update: { quantity },
    create: { userId, stickerId: sticker.id, quantity },
  });
}

export async function bulkCollect(numbers: number[], userId: string) {
  const stickers = await db.sticker.findMany({
    where: { number: { in: numbers } },
    include: { userStickers: { where: { userId } } },
  });

  const updates = await Promise.all(
    stickers.map((sticker) =>
      db.userSticker.upsert({
        where: { userId_stickerId: { userId, stickerId: sticker.id } },
        update: { quantity: { increment: 1 } },
        create: { userId, stickerId: sticker.id, quantity: 1 },
      })
    )
  );

  return {
    updated: updates.length,
    notFound: numbers.filter((n) => !stickers.find((s) => s.number === n)),
  };
}

export async function importAlbum(codes: string[], userId: string) {
  const stickers = await db.sticker.findMany({
    where: { code: { in: codes, mode: "insensitive" } },
  });

  const updates = await Promise.all(
    stickers.map((sticker) =>
      db.userSticker.upsert({
        where: { userId_stickerId: { userId, stickerId: sticker.id } },
        update: { quantity: { increment: 1 } },
        create: { userId, stickerId: sticker.id, quantity: 1 },
      })
    )
  );

  return {
    imported: updates.length,
    notFound: codes.filter(
      (c) => !stickers.find((s) => s.code.toLowerCase() === c.toLowerCase())
    ),
  };
}

export async function compareAlbum(friendCodes: string[], userId: string) {
  const allStickers = await db.sticker.findMany({
    include: {
      userStickers: { where: { userId } },
      section: { select: { code: true, name: true, flagEmoji: true } },
    },
    orderBy: { number: "asc" },
  });

  const friendSet = new Set(friendCodes.map((c) => c.toUpperCase()));

  const iCanGive: typeof result = [];
  const theyCanGive: typeof result = [];
  const perfectTrades: { mine: typeof result[number]; theirs: typeof result[number] }[] = [];
  const bothHave: typeof result = [];
  const bothNeed: typeof result = [];

  type StickerInfo = {
    code: string;
    name: string;
    number: number;
    myQty: number;
    section: { code: string; name: string; flagEmoji: string | null };
  };

  const result: StickerInfo[] = [];

  const myDuplicateCodes: StickerInfo[] = [];
  const theyHaveINeed: StickerInfo[] = [];

  for (const s of allStickers) {
    const myQty = s.userStickers[0]?.quantity ?? 0;
    const friendHas = friendSet.has(s.code.toUpperCase());
    const info: StickerInfo = {
      code: s.code,
      name: s.name,
      number: s.number,
      myQty,
      section: s.section,
    };

    if (friendHas && myQty >= 1) {
      bothHave.push(info);
    } else if (!friendHas && myQty === 0) {
      bothNeed.push(info);
    } else if (!friendHas && myQty >= 2) {
      iCanGive.push(info);
      myDuplicateCodes.push(info);
    } else if (friendHas && myQty === 0) {
      theyCanGive.push(info);
      theyHaveINeed.push(info);
    } else if (!friendHas && myQty === 1) {
      // I have it but no duplicate, friend doesn't — no trade value
    } else if (friendHas && myQty >= 2) {
      bothHave.push(info);
      myDuplicateCodes.push(info);
    }
  }

  for (const mine of myDuplicateCodes) {
    for (const theirs of theyHaveINeed) {
      perfectTrades.push({ mine, theirs });
    }
  }

  return {
    summary: {
      iCanGive: iCanGive.length,
      theyCanGive: theyCanGive.length,
      perfectTrades: Math.min(myDuplicateCodes.length, theyHaveINeed.length),
      bothHave: bothHave.length,
      bothNeed: bothNeed.length,
    },
    iCanGive,
    theyCanGive,
    perfectTrades: perfectTrades.slice(0, 50),
    bothHave,
    bothNeed,
  };
}

export async function bulkCollectByCodes(codes: string[], userId: string) {
  const stickers = await db.sticker.findMany({
    where: { code: { in: codes } },
    include: { userStickers: { where: { userId } } },
  });

  const updates = await Promise.all(
    stickers.map((sticker) =>
      db.userSticker.upsert({
        where: { userId_stickerId: { userId, stickerId: sticker.id } },
        update: { quantity: { increment: 1 } },
        create: { userId, stickerId: sticker.id, quantity: 1 },
      })
    )
  );

  return {
    updated: updates.length,
    notFound: codes.filter((c) => !stickers.find((s) => s.code === c)),
  };
}
