import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  church: {
    findFirst: jest.fn(),
  },
  churchMember: {
    findFirst: jest.fn(),
  },
};

const safeUser = {
  id: "u1",
  name: "João",
  email: "j@email.com",
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.resetAllMocks();
  });

  describe("findMyProfile", () => {
    it("deve retornar perfil com adminChurch quando é adminId de uma igreja", async () => {
      const adminChurch = { id: "c1", name: "Igreja A" };
      mockPrisma.user.findUnique.mockResolvedValue(safeUser);
      mockPrisma.church.findFirst.mockResolvedValue(adminChurch);

      const result = await service.findMyProfile("u1");

      expect(result.adminChurch).toEqual(adminChurch);
    });

    it("deve retornar perfil com adminChurch via membership quando não é adminId", async () => {
      const adminChurch = { id: "c2", name: "Igreja B" };
      mockPrisma.user.findUnique.mockResolvedValue(safeUser);
      mockPrisma.church.findFirst.mockResolvedValue(null);
      mockPrisma.churchMember.findFirst.mockResolvedValue({ church: adminChurch });

      const result = await service.findMyProfile("u1");

      expect(result.adminChurch).toEqual(adminChurch);
    });

    it("deve retornar adminChurch como null quando não é admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(safeUser);
      mockPrisma.church.findFirst.mockResolvedValue(null);
      mockPrisma.churchMember.findFirst.mockResolvedValue(null);

      const result = await service.findMyProfile("u1");

      expect(result.adminChurch).toBeNull();
    });

    it("deve lançar NotFoundException quando usuário não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findMyProfile("nope")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findById", () => {
    it("deve retornar usuário sem password quando encontrado", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(safeUser);

      const result = await service.findById("u1");

      expect(result).toEqual(safeUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "u1" },
        omit: { password: true },
      });
    });

    it("deve lançar NotFoundException quando usuário não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById("nope")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("deve retornar lista de usuários sem password", async () => {
      mockPrisma.user.findMany.mockResolvedValue([safeUser]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({ omit: { password: true } });
    });
  });

  describe("update", () => {
    it("deve atualizar e retornar usuário atualizado", async () => {
      const dto = { name: "João Novo" };
      const updated = { ...safeUser, name: "João Novo" };
      mockPrisma.user.findUnique.mockResolvedValue(safeUser);
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.update("u1", dto);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: dto,
        omit: { password: true },
      });
      expect(result).toEqual(updated);
    });

    it("deve lançar NotFoundException quando usuário não existe ao atualizar", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update("nope", { name: "X" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("deve deletar usuário existente", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(safeUser);
      mockPrisma.user.delete.mockResolvedValue(undefined);

      await service.remove("u1");

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
    });

    it("deve lançar NotFoundException quando usuário não existe ao remover", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove("nope")).rejects.toThrow(NotFoundException);
    });
  });
});
