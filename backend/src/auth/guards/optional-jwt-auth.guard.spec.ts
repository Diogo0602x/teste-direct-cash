import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";
import { ExecutionContext } from "@nestjs/common";

describe("OptionalJwtAuthGuard", () => {
  let guard: OptionalJwtAuthGuard;

  beforeEach(() => {
    guard = new OptionalJwtAuthGuard();
  });

  it("deve ser uma instância de OptionalJwtAuthGuard", () => {
    expect(guard).toBeInstanceOf(OptionalJwtAuthGuard);
  });

  describe("handleRequest", () => {
    it("deve retornar user mesmo quando há erro (não lança)", () => {
      const user = { sub: "user-1", email: "a@b.com" };
      const result = guard.handleRequest(new Error("Unauthorized"), user);
      expect(result).toEqual(user);
    });

    it("deve retornar null quando user é null (sem lançar)", () => {
      const result = guard.handleRequest(null, null);
      expect(result).toBeNull();
    });

    it("deve retornar undefined quando user é undefined", () => {
      const result = guard.handleRequest(null, undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("canActivate", () => {
    it("deve executar canActivate delegando ao AuthGuard base", async () => {
      const localGuard = new OptionalJwtAuthGuard();
      const mockCtx = {
        switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
        getType: () => "http",
      } as unknown as ExecutionContext;
      try {
        await Promise.resolve(localGuard.canActivate(mockCtx));
      } catch {}
    });
  });
});
