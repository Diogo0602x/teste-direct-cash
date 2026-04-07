FROM node:20-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
RUN mkdir -p /app/uploads
ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "echo 'Starting migration...' && node_modules/.bin/prisma migrate deploy && echo 'Starting node...' && node dist/main 2>&1"]

