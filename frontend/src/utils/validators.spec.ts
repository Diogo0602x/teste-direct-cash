import { loginSchema, registerSchema, createChurchSchema } from "./validators";

describe("loginSchema", () => {
  it("deve aceitar credenciais válidas", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "senha" });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar e-mail inválido", () => {
    const result = loginSchema.safeParse({ email: "nao-email", password: "senha" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar senha vazia", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = { name: "João Silva", email: "joao@email.com", password: "senha123" };

  it("deve aceitar dados válidos", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("deve rejeitar nome com menos de 2 caracteres", () => {
    const result = registerSchema.safeParse({ ...valid, name: "J" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar nome muito longo", () => {
    const result = registerSchema.safeParse({ ...valid, name: "J".repeat(121) });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar e-mail inválido", () => {
    const result = registerSchema.safeParse({ ...valid, email: "invalido" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar senha com menos de 8 caracteres", () => {
    const result = registerSchema.safeParse({ ...valid, password: "123456" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar senha muito longa", () => {
    const result = registerSchema.safeParse({ ...valid, password: "x".repeat(73) });
    expect(result.success).toBe(false);
  });
});

describe("createChurchSchema", () => {
  const valid = { name: "Igreja Nova" };

  it("deve aceitar apenas o nome obrigatório", () => {
    expect(createChurchSchema.safeParse(valid).success).toBe(true);
  });

  it("deve rejeitar nome com menos de 2 caracteres", () => {
    expect(createChurchSchema.safeParse({ name: "X" }).success).toBe(false);
  });

  it("deve rejeitar nome muito longo", () => {
    expect(createChurchSchema.safeParse({ name: "N".repeat(201) }).success).toBe(false);
  });

  it("deve aceitar description, address, city, state opcionais", () => {
    const result = createChurchSchema.safeParse({
      ...valid,
      description: "Descrição",
      address: "Rua A",
      city: "SP",
      state: "SP",
    });
    expect(result.success).toBe(true);
  });

  it("deve aceitar CEP válido com hífen", () => {
    expect(createChurchSchema.safeParse({ ...valid, zipCode: "12345-678" }).success).toBe(true);
  });

  it("deve aceitar CEP válido sem hífen", () => {
    expect(createChurchSchema.safeParse({ ...valid, zipCode: "12345678" }).success).toBe(true);
  });

  it("deve rejeitar CEP inválido", () => {
    expect(createChurchSchema.safeParse({ ...valid, zipCode: "123" }).success).toBe(false);
  });

  it("deve aceitar zipCode vazio (string vazia)", () => {
    expect(createChurchSchema.safeParse({ ...valid, zipCode: "" }).success).toBe(true);
  });

  it("deve aceitar logoUrl válida", () => {
    expect(createChurchSchema.safeParse({ ...valid, logoUrl: "https://logo.com/img.png" }).success).toBe(true);
  });

  it("deve aceitar logoUrl vazia", () => {
    expect(createChurchSchema.safeParse({ ...valid, logoUrl: "" }).success).toBe(true);
  });

  it("deve rejeitar logoUrl inválida", () => {
    expect(createChurchSchema.safeParse({ ...valid, logoUrl: "nao-url" }).success).toBe(false);
  });

  it("deve aceitar website válido", () => {
    expect(createChurchSchema.safeParse({ ...valid, website: "https://minha-igreja.com" }).success).toBe(true);
  });

  it("deve aceitar website vazio", () => {
    expect(createChurchSchema.safeParse({ ...valid, website: "" }).success).toBe(true);
  });
});
