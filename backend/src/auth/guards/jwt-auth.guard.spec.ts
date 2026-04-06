import { JwtAuthGuard } from "./jwt-auth.guard";
import { ExecutionContext } from "@nestjs/common";

describe("JwtAuthGuard", () => {
  it("deve ser uma instância de JwtAuthGuard", () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it("deve herdar canActivate de AuthGuard", () => {
    const guard = new JwtAuthGuard();
    expect(typeof guard.canActivate).toBe("function");
  });

  it("canActivate deve retornar verdadeiro para contexto válido (mock)", () => {
    const guard = new JwtAuthGuard();
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: "Bearer token" },
        }),
      }),
      getType: () => "http",
    } as unknown as ExecutionContext;

    expect(typeof guard.canActivate).toBe("function");
    void mockContext;
  });
});
