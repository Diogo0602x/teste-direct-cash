FROM node:20-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]

FROM node:20-slim AS production
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
RUN mkdir -p /app/uploads
ENV NODE_ENV=production
# Alinha com o target port padrão do domínio público no Railway (8080). O Railway
# sobrescreve PORT em runtime quando injeta a variável — se não injetar, o proxy
# continua apontando para 8080 e o Nest precisa escutar nessa porta.
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "set -e && npx prisma migrate deploy && exec node dist/main"]

