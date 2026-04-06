import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  describe("validate", () => {
    it("deve retornar payload com sub e email", () => {
      const payload = { sub: "user-id-1", email: "user@example.com", iat: 1000, exp: 9999 };
      const result = strategy.validate(payload);

      expect(result).toEqual({ sub: "user-id-1", email: "user@example.com" });
    });

    it("deve omitir iat e exp do retorno", () => {
      const payload = { sub: "abc", email: "a@b.com", iat: 100, exp: 200 };
      const result = strategy.validate(payload);

      expect(result).not.toHaveProperty("iat");
      expect(result).not.toHaveProperty("exp");
    });
  });
});
