import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
    controller = new AppController(service);
  });

  describe("getHealth", () => {
    it("deve retornar o resultado de AppService.getHealth", () => {
      const mockResult = {
        status: "ok" as const,
        timestamp: "2026-01-01T00:00:00.000Z",
        version: "0.1.0",
      };
      jest.spyOn(service, "getHealth").mockReturnValue(mockResult);

      expect(controller.getHealth()).toEqual(mockResult);
    });
  });
});
