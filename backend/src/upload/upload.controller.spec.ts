import { BadRequestException } from "@nestjs/common";
import { UploadController } from "./upload.controller";

const fakeFile = (filename: string, mimetype: string, size = 1024): Express.Multer.File =>
  ({
    fieldname: "file",
    originalname: filename,
    encoding: "7bit",
    mimetype,
    size,
    filename,
    path: `/uploads/${filename}`,
    destination: "/uploads",
    buffer: Buffer.from(""),
    stream: {} as never,
  }) as unknown as Express.Multer.File;

const req = { user: { sub: "user-1", email: "user@email.com" } } as never;

describe("UploadController", () => {
  let controller: UploadController;

  beforeEach(() => {
    controller = new UploadController();
    delete process.env.BACKEND_URL;
  });

  describe("uploadFile", () => {
    it("deve retornar a URL do arquivo com o BACKEND_URL padrão", () => {
      const file = fakeFile("abc123.jpg", "image/jpeg");

      const result = controller.uploadFile(file, req);

      expect(result).toEqual({ url: "http://localhost:4000/uploads/abc123.jpg" });
    });

    it("deve usar a variável de ambiente BACKEND_URL quando definida", () => {
      process.env.BACKEND_URL = "https://api.meusite.com";
      const file = fakeFile("img.png", "image/png");

      const result = controller.uploadFile(file, req);

      expect(result).toEqual({ url: "https://api.meusite.com/uploads/img.png" });
    });

    it("deve lançar BadRequestException quando nenhum arquivo é enviado", () => {
      expect(() => controller.uploadFile(undefined as never, req)).toThrow(BadRequestException);
      expect(() => controller.uploadFile(undefined as never, req)).toThrow(
        "Nenhum arquivo enviado",
      );
    });

    it("deve aceitar imagem webp e retornar URL correta", () => {
      const file = fakeFile("foto.webp", "image/webp");

      const result = controller.uploadFile(file, req);

      expect(result).toEqual({ url: "http://localhost:4000/uploads/foto.webp" });
    });

    it("deve aceitar imagem gif e retornar URL correta", () => {
      const file = fakeFile("anim.gif", "image/gif");

      const result = controller.uploadFile(file, req);

      expect(result).toEqual({ url: "http://localhost:4000/uploads/anim.gif" });
    });
  });
});
