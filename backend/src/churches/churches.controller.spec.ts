import { ChurchesController } from "./churches.controller";
import { ChurchesService } from "./churches.service";
import { AuthenticatedRequest } from "../types";

const mockService = {
  create: jest.fn(),
  lookupCnpj: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  requestJoin: jest.fn(),
  getMembers: jest.fn(),
  getPendingRequests: jest.fn(),
  approveMember: jest.fn(),
  rejectMember: jest.fn(),
  updateMemberRole: jest.fn(),
  removeMember: jest.fn(),
  addAdminByEmail: jest.fn(),
  getSchedules: jest.fn(),
  createSchedule: jest.fn(),
  updateSchedule: jest.fn(),
  deleteSchedule: jest.fn(),
  getEvents: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
};

const req = { user: { sub: "admin-1", email: "admin@email.com" } } as AuthenticatedRequest;
const church = { id: "c1", name: "Igreja A", adminId: "admin-1" };

describe("ChurchesController", () => {
  let controller: ChurchesController;

  beforeEach(() => {
    controller = new ChurchesController(mockService as unknown as ChurchesService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve chamar service.create com dto e userId", async () => {
      const dto = { cnpj: "00108217011154" };
      mockService.create.mockResolvedValue(church);

      const result = await controller.create(dto, req);

      expect(mockService.create).toHaveBeenCalledWith(dto, "admin-1");
      expect(result).toEqual(church);
    });
  });

  describe("lookupCnpj", () => {
    it("deve chamar service.lookupCnpj com o cnpj informado", async () => {
      const data = { cnpj: "00108217011154", name: "Igreja Teste" };
      mockService.lookupCnpj.mockResolvedValue(data);

      const result = await controller.lookupCnpj("00108217011154");

      expect(mockService.lookupCnpj).toHaveBeenCalledWith("00108217011154");
      expect(result).toEqual(data);
    });
  });

  describe("findAll", () => {
    it("deve chamar service.findAll com params paginados padrões", async () => {
      mockService.findAll.mockResolvedValue({
        data: [church],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const result = await controller.findAll("1", "10");

      expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toBeDefined();
    });

    it("deve usar defaults quando page e limit são undefined", async () => {
      mockService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await controller.findAll(undefined as unknown as string, undefined as unknown as string);

      expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it("deve limitar o limit a 100", async () => {
      mockService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      await controller.findAll("1", "999");

      expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 100 });
    });
  });

  describe("findOne", () => {
    it("deve chamar service.findById com o id", async () => {
      mockService.findById.mockResolvedValue(church);

      const result = await controller.findOne("c1");

      expect(mockService.findById).toHaveBeenCalledWith("c1");
      expect(result).toEqual(church);
    });
  });

  describe("update", () => {
    it("deve chamar service.update com id, dto e userId", async () => {
      const dto = { name: "Atualizada" };
      mockService.update.mockResolvedValue({ ...church, ...dto });

      const result = await controller.update("c1", dto, req);

      expect(mockService.update).toHaveBeenCalledWith("c1", dto, "admin-1");
      expect(result).toBeDefined();
    });
  });

  describe("remove", () => {
    it("deve chamar service.remove com id e userId", async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove("c1", req);

      expect(mockService.remove).toHaveBeenCalledWith("c1", "admin-1");
    });
  });

  describe("requestJoin", () => {
    it("deve chamar service.requestJoin com churchId e userId", async () => {
      mockService.requestJoin.mockResolvedValue({ id: "m1", status: "PENDING" });

      const result = await controller.requestJoin("c1", req);

      expect(mockService.requestJoin).toHaveBeenCalledWith("c1", "admin-1");
      expect(result).toBeDefined();
    });
  });

  describe("getMembers", () => {
    it("deve chamar service.getMembers com churchId e params", async () => {
      mockService.getMembers.mockResolvedValue({ data: [], total: 0 });

      await controller.getMembers("c1", "1", "20");

      expect(mockService.getMembers).toHaveBeenCalledWith("c1", { page: 1, limit: 20 });
    });

    it("deve usar defaults quando page e limit são undefined", async () => {
      mockService.getMembers.mockResolvedValue({ data: [], total: 0 });

      await controller.getMembers(
        "c1",
        undefined as unknown as string,
        undefined as unknown as string,
      );

      expect(mockService.getMembers).toHaveBeenCalledWith("c1", { page: 1, limit: 20 });
    });

    it("deve limitar o limit a 100", async () => {
      mockService.getMembers.mockResolvedValue({ data: [], total: 0 });

      await controller.getMembers("c1", "1", "999");

      expect(mockService.getMembers).toHaveBeenCalledWith("c1", { page: 1, limit: 100 });
    });
  });

  describe("getPendingRequests", () => {
    it("deve chamar service.getPendingRequests com churchId e userId", async () => {
      mockService.getPendingRequests.mockResolvedValue([]);

      await controller.getPendingRequests("c1", req);

      expect(mockService.getPendingRequests).toHaveBeenCalledWith("c1", "admin-1");
    });
  });

  describe("approveMember", () => {
    it("deve chamar service.approveMember com params corretos", async () => {
      mockService.approveMember.mockResolvedValue({ id: "m1", status: "ACTIVE" });

      await controller.approveMember("c1", "user-2", req);

      expect(mockService.approveMember).toHaveBeenCalledWith("c1", "user-2", "admin-1");
    });
  });

  describe("rejectMember", () => {
    it("deve chamar service.rejectMember com params corretos", async () => {
      mockService.rejectMember.mockResolvedValue({ id: "m1", status: "REJECTED" });

      await controller.rejectMember("c1", "user-2", req);

      expect(mockService.rejectMember).toHaveBeenCalledWith("c1", "user-2", "admin-1");
    });
  });

  describe("updateMemberRole", () => {
    it("deve chamar service.updateMemberRole com params corretos", async () => {
      mockService.updateMemberRole.mockResolvedValue({ id: "m1", role: "ADMIN" });

      await controller.updateMemberRole("c1", "user-2", "ADMIN", req);

      expect(mockService.updateMemberRole).toHaveBeenCalledWith("c1", "user-2", "ADMIN", "admin-1");
    });
  });

  describe("removeMember", () => {
    it("deve chamar service.removeMember com params corretos", async () => {
      mockService.removeMember.mockResolvedValue(undefined);

      await controller.removeMember("c1", "user-2", req);

      expect(mockService.removeMember).toHaveBeenCalledWith("c1", "user-2", "admin-1");
    });
  });

  describe("addAdmin", () => {
    it("deve chamar service.addAdminByEmail com churchId, email e userId", async () => {
      const member = { id: "m1", role: "ADMIN" };
      mockService.addAdminByEmail.mockResolvedValue(member);

      const result = await controller.addAdmin("c1", "novo@admin.com", req);

      expect(mockService.addAdminByEmail).toHaveBeenCalledWith("c1", "novo@admin.com", "admin-1");
      expect(result).toEqual(member);
    });
  });

  const schedule = {
    id: "s1",
    churchId: "c1",
    type: "MASS",
    title: "Missa Dominical",
    daysOfWeek: [0],
    time: "10:00",
  };

  describe("getSchedules", () => {
    it("deve chamar service.getSchedules com churchId", async () => {
      mockService.getSchedules.mockResolvedValue([schedule]);

      const result = await controller.getSchedules("c1");

      expect(mockService.getSchedules).toHaveBeenCalledWith("c1");
      expect(result).toEqual([schedule]);
    });
  });

  describe("createSchedule", () => {
    it("deve chamar service.createSchedule com churchId, dto e userId", async () => {
      const dto = { type: "MASS" as const, title: "Missa", daysOfWeek: [0, 6], time: "10:00" };
      mockService.createSchedule.mockResolvedValue(schedule);

      const result = await controller.createSchedule("c1", dto, req);

      expect(mockService.createSchedule).toHaveBeenCalledWith("c1", dto, "admin-1");
      expect(result).toEqual(schedule);
    });
  });

  describe("updateSchedule", () => {
    it("deve chamar service.updateSchedule com params corretos", async () => {
      const dto = { time: "11:00" };
      mockService.updateSchedule.mockResolvedValue({ ...schedule, time: "11:00" });

      const result = await controller.updateSchedule("c1", "s1", dto, req);

      expect(mockService.updateSchedule).toHaveBeenCalledWith("c1", "s1", dto, "admin-1");
      expect(result).toBeDefined();
    });
  });

  describe("deleteSchedule", () => {
    it("deve chamar service.deleteSchedule com params corretos", async () => {
      mockService.deleteSchedule.mockResolvedValue(undefined);

      await controller.deleteSchedule("c1", "s1", req);

      expect(mockService.deleteSchedule).toHaveBeenCalledWith("c1", "s1", "admin-1");
    });
  });

  const event = { id: "e1", churchId: "c1", title: "Retiro Espiritual", startDate: "2026-06-01" };

  describe("getEvents", () => {
    it("deve chamar service.getEvents com churchId", async () => {
      mockService.getEvents.mockResolvedValue([event]);

      const result = await controller.getEvents("c1");

      expect(mockService.getEvents).toHaveBeenCalledWith("c1");
      expect(result).toEqual([event]);
    });
  });

  describe("createEvent", () => {
    it("deve chamar service.createEvent com churchId, dto e userId", async () => {
      const dto = { title: "Retiro", startDate: "2026-06-01T08:00:00.000Z" };
      mockService.createEvent.mockResolvedValue(event);

      const result = await controller.createEvent("c1", dto, req);

      expect(mockService.createEvent).toHaveBeenCalledWith("c1", dto, "admin-1");
      expect(result).toEqual(event);
    });
  });

  describe("updateEvent", () => {
    it("deve chamar service.updateEvent com params corretos", async () => {
      const dto = { title: "Novo Título" };
      mockService.updateEvent.mockResolvedValue({ ...event, title: "Novo Título" });

      const result = await controller.updateEvent("c1", "e1", dto, req);

      expect(mockService.updateEvent).toHaveBeenCalledWith("c1", "e1", dto, "admin-1");
      expect(result).toBeDefined();
    });
  });

  describe("deleteEvent", () => {
    it("deve chamar service.deleteEvent com params corretos", async () => {
      mockService.deleteEvent.mockResolvedValue(undefined);

      await controller.deleteEvent("c1", "e1", req);

      expect(mockService.deleteEvent).toHaveBeenCalledWith("c1", "e1", "admin-1");
    });
  });
});
