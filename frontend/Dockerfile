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
# Next.js embute NEXT_PUBLIC_* no cliente no momento do `next build`. Sem isso aqui,
# a imagem de produção continua com http://localhost:4000 mesmo com a var só no runtime.
# No Railway: defina NEXT_PUBLIC_BACKEND_URL nas variáveis do serviço e faça rebuild.
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ARG NEXT_PUBLIC_APP_NAME=Fé Viva
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# Alinha EXPOSE/PORT com o que o Railway costuma injetar (~8080). Se o target port do
# domínio ficar em 3000 e o Next escutar em 8080, o healthcheck passa mas o tráfego
# público devolve 502.
ENV PORT=8080
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 8080
CMD ["npm", "start"]
