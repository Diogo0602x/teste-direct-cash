import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { mkdirSync } from "fs";
import { join } from "path";
import type { Response } from "express";
import { AppModule } from "./app.module";

process.on("uncaughtException", (err) => {
  process.stderr.write(`UNCAUGHT EXCEPTION: ${err.stack ?? err.message}\n`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`UNHANDLED REJECTION: ${String(reason)}\n`);
  process.exit(1);
});

process.stderr.write("main.ts carregado, iniciando bootstrap...\n");

async function bootstrap(): Promise<void> {
  // Garante que a pasta de uploads existe (ignora erro em ambientes read-only)
  try {
    mkdirSync(join(process.cwd(), "uploads"), { recursive: true });
  } catch {
    // sem-op em produção
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");

  // Railway e load balancers costumam sondar "/"; sem isso retorna 404 e o healthcheck falha.
  app.getHttpAdapter().get("/", (_req, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // Swagger — acessível em /api/docs
  const config = new DocumentBuilder()
    .setTitle("ChurchNet API")
    .setDescription("API REST para gestão de igrejas e comunidades religiosas")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "JWT")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port, "0.0.0.0");
  console.log(`🚀 Backend rodando em: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs em:   http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error("FATAL: bootstrap falhou", err);
  process.exit(1);
});
