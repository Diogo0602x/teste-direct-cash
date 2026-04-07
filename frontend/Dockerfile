FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
# NEXT_PUBLIC_* é fixado no `next build` — defina no build (Railway/Docker).
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api/v1=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ARG NEXT_PUBLIC_APP_NAME=Fé Viva
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# PORT/EXPOSE alinhados ao proxy (ex.: Railway ~8080).
ENV PORT=8080
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 8080
CMD ["npm", "start"]
