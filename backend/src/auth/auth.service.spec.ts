import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue("mock-token"),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.resetAllMocks();
    mockJwt.sign.mockReturnValue("mock-token");
  });

  describe("register", () => {
    const dto = { name: "João", email: "joao@email.com", password: "senha1234" };

    it("deve criar usuário e retornar token quando e-mail não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        name: dto.name,
        email: dto.email,
      });

      const result = await service.register(dto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe("mock-token");
      expect(result.user.email).toBe(dto.email);
    });

    it("deve lançar ConflictException quando e-mail já existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it("deve fazer hash da senha antes de salvar", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(async ({ data }) => ({
        id: "u1",
        name: data.name,
        email: data.email,
      }));

      await service.register(dto);

      const createdData = mockPrisma.user.create.mock.calls[0][0].data;
      const isHashed = await bcrypt.compare(dto.password, createdData.password);
      expect(isHashed).toBe(true);
    });
  });

  describe("login", () => {
    const dto = { email: "joao@email.com", password: "senha1234" };

    it("deve retornar token quando credenciais são válidas", async () => {
      const hashedPwd = await bcrypt.hash(dto.password, 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "João",
        email: dto.email,
        password: hashedPwd,
      });

      const result = await service.login(dto);

      expect(result.accessToken).toBe("mock-token");
      expect(result.user.email).toBe(dto.email);
    });

    it("deve lançar UnauthorizedException quando usuário não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it("deve lançar UnauthorizedException quando senha está errada", async () => {
      const hashedPwd = await bcrypt.hash("outra-senha", 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "João",
        email: dto.email,
        password: hashedPwd,
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
