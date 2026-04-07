import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { randomBytes } from "crypto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "../types";
import type { Express } from "express";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

@Controller("upload")
export class UploadController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: join(process.cwd(), "uploads"),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase() || ".jpg";
          const name = randomBytes(16).toString("hex");
          cb(null, `${name}${ext}`);
        },
      }),
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException("Apenas imagens JPEG, PNG, WebP ou GIF são permitidas"),
            false,
          );
        }
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() _req: AuthenticatedRequest,
  ): { url: string } {
    if (!file) throw new BadRequestException("Nenhum arquivo enviado");
    const baseUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
    return { url: `${baseUrl}/uploads/${file.filename}` };
  }
}
