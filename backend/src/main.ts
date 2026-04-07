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

async function bootstrap(): Promise<void> {
  try {
    mkdirSync(join(process.cwd(), "uploads"), { recursive: true });
  } catch {}

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

  app.getHttpAdapter().get("/", (_req, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  const config = new DocumentBuilder()
    .setTitle("Fé Viva API")
    .setDescription("API REST da plataforma Fé Viva — gestão de igrejas e comunidades religiosas")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "JWT")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const rawPort = process.env.PORT;
  const port =
    rawPort !== undefined && rawPort !== ""
      ? Number.parseInt(rawPort, 10)
      : 4000;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT inválida: ${String(rawPort)}`);
  }
  await app.listen(port, "0.0.0.0");
  console.log(`🚀 Backend rodando em: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs em:   http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error("FATAL: bootstrap falhou", err);
  process.exit(1);
});
