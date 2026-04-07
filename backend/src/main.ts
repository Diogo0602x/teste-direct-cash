import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { mkdirSync } from "fs";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  // Garante que a pasta de uploads existe
  mkdirSync(join(process.cwd(), "uploads"), { recursive: true });

  const app = await NestFactory.create(AppModule);

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

bootstrap();
