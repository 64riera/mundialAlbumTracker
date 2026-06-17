FROM node:20-slim AS system-deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    tesseract-ocr \
    tesseract-ocr-eng \
    python3 \
    python3-pip \
    wget \
    && wget -q https://github.com/tesseract-ocr/tessdata_best/raw/main/eng.traineddata \
       -O /usr/share/tesseract-ocr/5/tessdata/eng.traineddata \
    && apt-get remove -y wget \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
RUN pip3 install --break-system-packages --no-cache-dir rapidocr-onnxruntime && \
    pip3 install --break-system-packages --no-cache-dir --force-reinstall opencv-python-headless && \
    pip3 uninstall -y opencv-python 2>/dev/null; true

FROM system-deps AS base
WORKDIR /app
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

FROM system-deps AS prod
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY package*.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
