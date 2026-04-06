import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { ChurchesService } from "./churches.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  church: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  churchMember: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  churchSchedule: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  churchEvent: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

const church = {
  id: "c1",
  name: "Igreja A",
  adminId: "admin-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const cnpjLookupResult = {
  cnpj: "00108217011154",
  cnpjFormatted: "00.108.217/0111-54",
  razaoSocial: "MITRA ARQUIDIOCESANA DE BRASILIA",
  nomeFantasia: "PAROQUIA NOSSA SENHORA DA ASSUNCAO",
  name: "PAROQUIA NOSSA SENHORA DA ASSUNCAO",
  city: "BRASILIA",
  state: "DF",
  zipCode: "70000000",
};

describe("ChurchesService", () => {
  let service: ChurchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChurchesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ChurchesService>(ChurchesService);
    jest.resetAllMocks();
  });

  describe("lookupCnpj", () => {
    const validCnpj = "11222333000181";

    it("deve lançar BadRequestException para CNPJ com dígitos inválidos", async () => {
      await expect(service.lookupCnpj("00000000000000")).rejects.toThrow(BadRequestException);
    });

    it("deve lançar BadRequestException para CNPJ com tamanho incorreto", async () => {
      await expect(service.lookupCnpj("123")).rejects.toThrow(BadRequestException);
    });

    it("deve lançar ConflictException quando CNPJ já está cadastrado", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ id: "c1", name: "Igreja Existente" });

      await expect(service.lookupCnpj(validCnpj)).rejects.toThrow(ConflictException);
    });

    it("deve lançar NotFoundException quando o CNPJ não existe na Receita Federal (404)", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      jest.spyOn(global, "fetch").mockResolvedValueOnce({ ok: false, status: 404 } as Response);

      await expect(service.lookupCnpj(validCnpj)).rejects.toThrow(NotFoundException);
    });

    it("deve lançar NotFoundException quando a API retorna 400 (CNPJ não encontrado)", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      jest.spyOn(global, "fetch").mockResolvedValueOnce({ ok: false, status: 400 } as Response);

      await expect(service.lookupCnpj(validCnpj)).rejects.toThrow(NotFoundException);
    });

    it("deve lançar BadRequestException quando a Receita Federal retorna rate-limit (429)", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      jest.spyOn(global, "fetch").mockResolvedValueOnce({ ok: false, status: 429 } as Response);

      await expect(service.lookupCnpj(validCnpj)).rejects.toThrow(BadRequestException);
    });

    it("deve lançar BadRequestException quando a API retorna erro genérico de servidor", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      jest.spyOn(global, "fetch").mockResolvedValueOnce({ ok: false, status: 503 } as Response);

      await expect(service.lookupCnpj(validCnpj)).rejects.toThrow(BadRequestException);
    });

    it("deve lançar BadRequestException em timeout (AbortError)", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      const abortErr = new Error("AbortError");
      abortErr.name = "AbortError";
      jest.spyOn(global, "fetch").mockRejectedValueOnce(abortErr);

      await expect(service.lookupCnpj(validCnpj)).rejects.toThrow(BadRequestException);
    });

    it("deve lançar BadRequestException em erro de rede", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      await expect(service.lookupCnpj(validCnpj)).rejects.toThrow(BadRequestException);
    });

    it("deve lançar BadRequestException quando CNPJ está inativo", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          razao_social: "Empresa",
          nome_fantasia: "",
          situacao_cadastral: "Inapta",
          municipio: "SP",
          uf: "SP",
        }),
      } as Response);

      await expect(service.lookupCnpj(validCnpj)).rejects.toThrow(BadRequestException);
    });

    it("deve retornar dados do CNPJ quando válido e ativo", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          razao_social: "MITRA ARQUIDIOCESANA",
          nome_fantasia: "PAROQUIA NOSSA SENHORA",
          situacao_cadastral: "Ativa",
          municipio: "BRASILIA",
          uf: "DF",
          cep: "70.000-000",
        }),
      } as Response);

      const result = await service.lookupCnpj(validCnpj);

      expect(result.name).toBe("PAROQUIA NOSSA SENHORA");
      expect(result.razaoSocial).toBe("MITRA ARQUIDIOCESANA");
      expect(result.city).toBe("BRASILIA");
      expect(result.state).toBe("DF");
    });

    it("deve usar razaoSocial quando nomeFantasia está vazio", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          razao_social: "MITRA ARQUIDIOCESANA",
          nome_fantasia: "",
          situacao_cadastral: "Ativa",
          municipio: "BRASILIA",
          uf: "DF",
        }),
      } as Response);

      const result = await service.lookupCnpj(validCnpj);
      expect(result.name).toBe("MITRA ARQUIDIOCESANA");
      expect(result.nomeFantasia).toBeNull();
    });
  });

  describe("create", () => {
    it("deve criar igreja usando dados do CNPJ e adicionar criador como ADMIN ACTIVE", async () => {
      const dto = { cnpj: "00108217011154" };
      jest.spyOn(service, "lookupCnpj").mockResolvedValue(cnpjLookupResult);
      mockPrisma.church.create.mockResolvedValue(church);
      mockPrisma.churchMember.create.mockResolvedValue({});

      const result = await service.create(dto, "admin-1");

      expect(service.lookupCnpj).toHaveBeenCalledWith(dto.cnpj);
      expect(mockPrisma.church.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ cnpj: cnpjLookupResult.cnpj, adminId: "admin-1" }),
      });
      expect(mockPrisma.churchMember.create).toHaveBeenCalledWith({
        data: { userId: "admin-1", churchId: "c1", role: "ADMIN", status: "ACTIVE" },
      });
      expect(result).toEqual(church);
    });

    it("deve propagar BadRequestException do lookupCnpj quando CNPJ é inválido", async () => {
      jest.spyOn(service, "lookupCnpj").mockRejectedValue(new BadRequestException("CNPJ inválido"));

      await expect(service.create({ cnpj: "00000000000000" }, "admin-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("deve retornar lista paginada de igrejas", async () => {
      mockPrisma.church.findMany.mockResolvedValue([church]);
      mockPrisma.church.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe("findById", () => {
    it("deve retornar a igreja quando encontrada", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(church);

      const result = await service.findById("c1");

      expect(result).toEqual(church);
    });

    it("deve lançar NotFoundException quando igreja não existe", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);

      await expect(service.findById("nope")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("deve atualizar igreja quando requester é o adminId", async () => {
      const updated = { ...church, name: "Igreja Atualizada" };
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.church.update.mockResolvedValue(updated);

      const result = await service.update("c1", { name: "Igreja Atualizada" }, "admin-1");

      expect(result).toEqual(updated);
    });

    it("deve lançar NotFoundException em assertAdmin quando igreja não existe", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);

      await expect(service.update("nope", {}, "user-1")).rejects.toThrow("Igreja não encontrada");
    });

    it("deve lançar ForbiddenException quando requester não é admin via membership", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.update("c1", {}, "user-2")).rejects.toThrow(
        "Apenas administradores podem realizar esta ação",
      );
    });

    it("deve lançar ForbiddenException quando membership é nula", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue(null);

      await expect(service.update("c1", {}, "user-2")).rejects.toThrow(ForbiddenException);
    });

    it("deve lançar ForbiddenException quando role é ADMIN mas status não é ACTIVE", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "ADMIN", status: "PENDING" });

      await expect(service.update("c1", {}, "user-2")).rejects.toThrow(ForbiddenException);
    });

    it("deve atualizar quando requester é ADMIN ativo via membership", async () => {
      const updated = { ...church, name: "Up" };
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" });
      mockPrisma.church.update.mockResolvedValue(updated);

      const result = await service.update("c1", { name: "Up" }, "admin-member");
      expect(result).toEqual(updated);
    });
  });

  describe("remove", () => {
    it("deve deletar a igreja quando requester é o adminId", async () => {
      const fullChurch = { ...church, admin: {}, _count: {} };
      mockPrisma.church.findUnique.mockResolvedValue(fullChurch);
      mockPrisma.church.delete.mockResolvedValue(undefined);

      await service.remove("c1", "admin-1");

      expect(mockPrisma.church.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
    });

    it("deve lançar ForbiddenException quando requester não é o adminId", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });

      await expect(service.remove("c1", "user-2")).rejects.toThrow(
        "Apenas o criador da igreja pode excluí-la",
      );
    });
  });

  describe("requestJoin", () => {
    it("deve criar nova solicitação quando não existe membership anterior", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });
      mockPrisma.churchMember.findUnique.mockResolvedValue(null);
      mockPrisma.churchMember.create.mockResolvedValue({
        id: "m1",
        role: "MEMBER",
        status: "PENDING",
      });

      const result = await service.requestJoin("c1", "user-2");
      expect(result).toBeDefined();
    });

    it("deve lançar ConflictException quando já é membro ACTIVE", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "ACTIVE" });

      await expect(service.requestJoin("c1", "user-1")).rejects.toThrow(ConflictException);
    });

    it("deve lançar ConflictException quando já tem solicitação PENDING", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "PENDING" });

      await expect(service.requestJoin("c1", "user-1")).rejects.toThrow(ConflictException);
    });

    it("deve reativar solicitação quando era REJECTED", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "REJECTED" });
      mockPrisma.churchMember.update.mockResolvedValue({ id: "m1", status: "PENDING" });

      const result = await service.requestJoin("c1", "user-2");
      expect(mockPrisma.churchMember.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("deve criar nova solicitação quando status é INACTIVE (branch de fallthrough)", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "INACTIVE" });
      mockPrisma.churchMember.create.mockResolvedValue({ id: "m2", status: "PENDING" });

      const result = await service.requestJoin("c1", "user-2");
      expect(mockPrisma.churchMember.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("getMembers", () => {
    it("deve retornar membros ativos paginados", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });
      mockPrisma.churchMember.findMany.mockResolvedValue([{ id: "m1" }]);
      mockPrisma.churchMember.count.mockResolvedValue(1);

      const result = await service.getMembers("c1", { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("getPendingRequests", () => {
    it("deve retornar solicitações pendentes para admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchMember.findMany.mockResolvedValue([{ id: "m1", status: "PENDING" }]);

      const result = await service.getPendingRequests("c1", "admin-1");

      expect(result).toHaveLength(1);
    });

    it("deve lançar ForbiddenException para não admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.getPendingRequests("c1", "user-2")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("approveMember", () => {
    it("deve aprovar membro PENDING", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "PENDING" });
      mockPrisma.churchMember.update.mockResolvedValue({ id: "m1", status: "ACTIVE" });

      const result = await service.approveMember("c1", "user-2", "admin-1");

      expect(mockPrisma.churchMember.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "ACTIVE" } }),
      );
      expect(result).toBeDefined();
    });

    it("deve lançar NotFoundException quando membro não encontrado", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchMember.findUnique.mockResolvedValue(null);

      await expect(service.approveMember("c1", "user-2", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("rejectMember", () => {
    it("deve rejeitar membro", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "PENDING" });
      mockPrisma.churchMember.update.mockResolvedValue({ id: "m1", status: "REJECTED" });

      const result = await service.rejectMember("c1", "user-2", "admin-1");

      expect(result).toBeDefined();
    });

    it("deve lançar NotFoundException quando membro não encontrado", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchMember.findUnique.mockResolvedValue(null);

      await expect(service.rejectMember("c1", "user-2", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateMemberRole", () => {
    it("deve atualizar papel do membro quando requester é o adminId da igreja", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({
        ...church,
        adminId: "admin-1",
        admin: {},
        _count: {},
      });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "ACTIVE" });
      mockPrisma.churchMember.update.mockResolvedValue({ id: "m1", role: "ADMIN" });

      const result = await service.updateMemberRole("c1", "user-2", "ADMIN", "admin-1");

      expect(result).toBeDefined();
    });

    it("deve lançar ForbiddenException quando requester não é o adminId", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({
        ...church,
        adminId: "other",
        admin: {},
        _count: {},
      });

      await expect(service.updateMemberRole("c1", "user-2", "ADMIN", "user-3")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("deve lançar NotFoundException quando membro não encontrado (null)", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({
        ...church,
        adminId: "admin-1",
        admin: {},
        _count: {},
      });
      mockPrisma.churchMember.findUnique.mockResolvedValue(null);

      await expect(service.updateMemberRole("c1", "user-2", "MEMBER", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("deve lançar NotFoundException quando membro existe mas não é ACTIVE", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({
        ...church,
        adminId: "admin-1",
        admin: {},
        _count: {},
      });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "PENDING" });

      await expect(service.updateMemberRole("c1", "user-2", "MEMBER", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("removeMember", () => {
    it("deve remover membro quando requester é admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ status: "ACTIVE" });
      mockPrisma.churchMember.delete.mockResolvedValue(undefined);

      await service.removeMember("c1", "user-2", "admin-1");

      expect(mockPrisma.churchMember.delete).toHaveBeenCalled();
    });

    it("deve lançar NotFoundException quando membro não encontrado", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchMember.findUnique.mockResolvedValue(null);

      await expect(service.removeMember("c1", "user-2", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("addAdminByEmail", () => {
    const memberResult = {
      id: "m1",
      role: "ADMIN",
      status: "ACTIVE",
      joinedAt: new Date(),
      user: { id: "user-2", name: "Maria", email: "maria@email.com", avatarUrl: null },
    };

    beforeEach(() => {
      mockPrisma.church.findUnique
        .mockResolvedValueOnce({ adminId: "admin-1" })
        .mockResolvedValueOnce({ ...church, admin: {}, _count: {} });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-2",
        name: "Maria",
        email: "maria@email.com",
      });
      mockPrisma.church.findFirst.mockResolvedValue(null);
      mockPrisma.churchMember.findFirst.mockResolvedValue(null);
    });

    it("deve criar membro como ADMIN quando usuário não é membro", async () => {
      mockPrisma.churchMember.findUnique.mockResolvedValue(null);
      mockPrisma.churchMember.create.mockResolvedValue(memberResult);

      const result = await service.addAdminByEmail("c1", "maria@email.com", "admin-1");

      expect(mockPrisma.churchMember.create).toHaveBeenCalledWith({
        data: { userId: "user-2", churchId: "c1", role: "ADMIN", status: "ACTIVE" },
        select: expect.any(Object),
      });
      expect(result).toBeDefined();
    });

    it("deve promover membro existente para ADMIN", async () => {
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });
      mockPrisma.churchMember.update.mockResolvedValue(memberResult);

      const result = await service.addAdminByEmail("c1", "maria@email.com", "admin-1");

      expect(mockPrisma.churchMember.update).toHaveBeenCalledWith({
        where: { userId_churchId: { userId: "user-2", churchId: "c1" } },
        data: { role: "ADMIN", status: "ACTIVE" },
        select: expect.any(Object),
      });
      expect(result).toBeDefined();
    });

    it("deve lançar NotFoundException quando usuário não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.addAdminByEmail("c1", "nao@existe.com", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("deve lançar ConflictException quando usuário já é admin desta igreja", async () => {
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" });

      await expect(service.addAdminByEmail("c1", "maria@email.com", "admin-1")).rejects.toThrow(
        ConflictException,
      );
    });

    it("deve lançar ConflictException quando usuário já é admin de outra igreja", async () => {
      mockPrisma.church.findFirst.mockResolvedValue({ name: "Outra Igreja" });

      await expect(service.addAdminByEmail("c1", "maria@email.com", "admin-1")).rejects.toThrow(
        ConflictException,
      );
    });

    it("deve lançar ForbiddenException quando requester não é admin da igreja", async () => {
      mockPrisma.church.findUnique
        .mockReset()
        .mockResolvedValueOnce({ adminId: "other" })
        .mockResolvedValueOnce({ ...church, admin: {}, _count: {} });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.addAdminByEmail("c1", "maria@email.com", "non-admin")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── Schedules ─────────────────────────────────────────────────────────────

  const schedule = {
    id: "s1",
    churchId: "c1",
    type: "MASS",
    title: "Missa Dominical",
    daysOfWeek: [0],
    time: "10:00",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("getSchedules", () => {
    it("deve retornar lista de horários da igreja", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });
      mockPrisma.churchSchedule.findMany.mockResolvedValue([schedule]);

      const result = await service.getSchedules("c1");

      expect(mockPrisma.churchSchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { churchId: "c1" } }),
      );
      expect(result).toEqual([schedule]);
    });

    it("deve lançar NotFoundException quando a igreja não existe", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);

      await expect(service.getSchedules("nao-existe")).rejects.toThrow(NotFoundException);
    });
  });

  describe("createSchedule", () => {
    it("deve criar um horário quando o requester é admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchSchedule.create.mockResolvedValue(schedule);

      const dto = {
        type: "MASS" as const,
        title: "Missa Dominical",
        daysOfWeek: [0],
        time: "10:00",
      };
      const result = await service.createSchedule("c1", dto, "admin-1");

      expect(mockPrisma.churchSchedule.create).toHaveBeenCalledWith({
        data: { ...dto, churchId: "c1" },
      });
      expect(result).toEqual(schedule);
    });

    it("deve lançar ForbiddenException quando requester não é admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "outro" });

      await expect(
        service.createSchedule(
          "c1",
          { type: "MASS" as const, title: "X", time: "10:00" },
          "not-admin",
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateSchedule", () => {
    it("deve atualizar um horário existente", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchSchedule.findFirst.mockResolvedValue(schedule);
      mockPrisma.churchSchedule.update.mockResolvedValue({ ...schedule, time: "11:00" });

      const result = await service.updateSchedule("c1", "s1", { time: "11:00" }, "admin-1");

      expect(mockPrisma.churchSchedule.update).toHaveBeenCalledWith({
        where: { id: "s1" },
        data: { time: "11:00" },
      });
      expect(result).toBeDefined();
    });

    it("deve lançar NotFoundException quando o horário não existe", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchSchedule.findFirst.mockResolvedValue(null);

      await expect(service.updateSchedule("c1", "nao-existe", {}, "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("deleteSchedule", () => {
    it("deve excluir um horário existente", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchSchedule.findFirst.mockResolvedValue(schedule);
      mockPrisma.churchSchedule.delete.mockResolvedValue(schedule);

      await service.deleteSchedule("c1", "s1", "admin-1");

      expect(mockPrisma.churchSchedule.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
    });

    it("deve lançar NotFoundException quando o horário não existe", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchSchedule.findFirst.mockResolvedValue(null);

      await expect(service.deleteSchedule("c1", "nao-existe", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Events ────────────────────────────────────────────────────────────────

  const event = {
    id: "e1",
    churchId: "c1",
    title: "Retiro Espiritual",
    description: "Descrição do evento",
    startDate: new Date("2026-06-01T08:00:00.000Z"),
    endDate: new Date("2026-06-02T18:00:00.000Z"),
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("getEvents", () => {
    it("deve retornar lista de eventos da igreja", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ ...church, admin: {}, _count: {} });
      mockPrisma.churchEvent.findMany.mockResolvedValue([event]);

      const result = await service.getEvents("c1");

      expect(mockPrisma.churchEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { churchId: "c1" } }),
      );
      expect(result).toEqual([event]);
    });

    it("deve lançar NotFoundException quando a igreja não existe", async () => {
      mockPrisma.church.findUnique.mockResolvedValue(null);

      await expect(service.getEvents("nao-existe")).rejects.toThrow(NotFoundException);
    });
  });

  describe("createEvent", () => {
    it("deve criar um evento quando o requester é admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchEvent.create.mockResolvedValue(event);

      const dto = {
        title: "Retiro Espiritual",
        startDate: "2026-06-01T08:00:00.000Z",
        endDate: "2026-06-02T18:00:00.000Z",
      };
      const result = await service.createEvent("c1", dto, "admin-1");

      expect(mockPrisma.churchEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ churchId: "c1", title: "Retiro Espiritual" }),
        }),
      );
      expect(result).toEqual(event);
    });

    it("deve lançar ForbiddenException quando requester não é admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "outro" });

      await expect(
        service.createEvent("c1", { title: "X", startDate: "2026-06-01" }, "not-admin"),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateEvent", () => {
    it("deve atualizar um evento existente", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchEvent.findFirst.mockResolvedValue(event);
      mockPrisma.churchEvent.update.mockResolvedValue({ ...event, title: "Novo Título" });

      const result = await service.updateEvent("c1", "e1", { title: "Novo Título" }, "admin-1");

      expect(mockPrisma.churchEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "e1" } }),
      );
      expect(result).toBeDefined();
    });

    it("deve lançar NotFoundException quando o evento não existe", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchEvent.findFirst.mockResolvedValue(null);

      await expect(service.updateEvent("c1", "nao-existe", {}, "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("deleteEvent", () => {
    it("deve excluir um evento existente", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchEvent.findFirst.mockResolvedValue(event);
      mockPrisma.churchEvent.delete.mockResolvedValue(event);

      await service.deleteEvent("c1", "e1", "admin-1");

      expect(mockPrisma.churchEvent.delete).toHaveBeenCalledWith({ where: { id: "e1" } });
    });

    it("deve lançar NotFoundException quando o evento não existe", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.churchEvent.findFirst.mockResolvedValue(null);

      await expect(service.deleteEvent("c1", "nao-existe", "admin-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
