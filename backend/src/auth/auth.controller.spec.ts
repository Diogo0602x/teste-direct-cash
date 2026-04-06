import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController(mockAuthService as unknown as AuthService);
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("deve chamar authService.register com o dto", async () => {
      const dto = { name: "João", email: "j@email.com", password: "senha1234" };
      const response = {
        accessToken: "token",
        user: { id: "1", name: "João", email: "j@email.com" },
      };
      mockAuthService.register.mockResolvedValue(response);

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe("login", () => {
    it("deve chamar authService.login com o dto", async () => {
      const dto = { email: "j@email.com", password: "senha1234" };
      const response = {
        accessToken: "token",
        user: { id: "1", name: "João", email: "j@email.com" },
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });
});
