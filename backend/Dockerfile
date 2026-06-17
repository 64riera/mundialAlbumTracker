FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl tesseract-ocr tesseract-ocr-data-eng
COPY package*.json ./
RUN npm install

FROM base AS dev
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS prod
WORKDIR /app
RUN apk add --no-cache openssl tesseract-ocr tesseract-ocr-data-eng
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3001/health || exit 1
CMD ["node", "dist/index.js"]
