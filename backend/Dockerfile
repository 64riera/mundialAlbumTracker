FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
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
RUN apk add --no-cache openssl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001
CMD ["npm", "run", "start"]
