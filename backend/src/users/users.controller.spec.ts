import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthenticatedRequest } from "../types";

const mockUsersService = {
  findById: jest.fn(),
  findMyProfile: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq = { user: { sub: "u1", email: "j@email.com" } } as AuthenticatedRequest;
const safeUser = { id: "u1", name: "João", email: "j@email.com" };

describe("UsersController", () => {
  let controller: UsersController;

  beforeEach(() => {
    controller = new UsersController(mockUsersService as unknown as UsersService);
    jest.clearAllMocks();
  });

  describe("getMe", () => {
    it("deve chamar findMyProfile com o id do usuário autenticado", async () => {
      const profile = { ...safeUser, adminChurch: null };
      mockUsersService.findMyProfile.mockResolvedValue(profile);

      const result = await controller.getMe(mockReq);

      expect(mockUsersService.findMyProfile).toHaveBeenCalledWith("u1");
      expect(result).toEqual(profile);
    });
  });

  describe("findOne", () => {
    it("deve chamar findById com o id do param", async () => {
      mockUsersService.findById.mockResolvedValue(safeUser);

      const result = await controller.findOne("u1");

      expect(mockUsersService.findById).toHaveBeenCalledWith("u1");
      expect(result).toEqual(safeUser);
    });
  });

  describe("updateMe", () => {
    it("deve chamar update com o id do usuário autenticado e dto", async () => {
      const dto = { name: "Novo Nome" };
      const updated = { ...safeUser, name: "Novo Nome" };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.updateMe(mockReq, dto);

      expect(mockUsersService.update).toHaveBeenCalledWith("u1", dto);
      expect(result).toEqual(updated);
    });
  });

  describe("removeMe", () => {
    it("deve chamar remove com o id do usuário autenticado", async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.removeMe(mockReq);

      expect(mockUsersService.remove).toHaveBeenCalledWith("u1");
    });
  });
});
