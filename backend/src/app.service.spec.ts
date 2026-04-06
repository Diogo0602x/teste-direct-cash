import { AppService } from "./app.service";

describe("AppService", () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  describe("getHealth", () => {
    it("deve retornar status ok com timestamp e versão", () => {
      const result = service.getHealth();

      expect(result.status).toBe("ok");
      expect(result.version).toBe("0.1.0");
      expect(typeof result.timestamp).toBe("string");
      expect(() => new Date(result.timestamp)).not.toThrow();
    });
  });
});
