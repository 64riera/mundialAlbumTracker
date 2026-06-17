-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('INTRO', 'TEAM', 'SPECIAL');

-- CreateEnum
CREATE TYPE "StickerType" AS ENUM ('PLAYER', 'BADGE', 'STADIUM', 'GROUP', 'SPECIAL', 'INTRO');

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "flagEmoji" TEXT,
    "confederation" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sticker" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StickerType" NOT NULL,
    "isShiny" BOOLEAN NOT NULL DEFAULT false,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sticker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSticker" (
    "id" TEXT NOT NULL,
    "stickerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSticker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_code_key" ON "Section"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Sticker_number_key" ON "Sticker"("number");

-- CreateIndex
CREATE INDEX "Sticker_sectionId_idx" ON "Sticker"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSticker_stickerId_key" ON "UserSticker"("stickerId");

-- AddForeignKey
ALTER TABLE "Sticker" ADD CONSTRAINT "Sticker_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSticker" ADD CONSTRAINT "UserSticker_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "Sticker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
