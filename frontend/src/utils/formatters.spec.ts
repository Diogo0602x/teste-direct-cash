import { formatDate, formatDateLong, formatCep, formatCnpjInput, cleanCnpj, truncateText, getInitials } from "./formatters";

describe("formatDate", () => {
  it("deve formatar data no padrão brasileiro (dd/mm/aaaa)", () => {
    const result = formatDate("2026-04-03T00:00:00.000Z");
    
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe("formatDateLong", () => {
  it("deve retornar string não-vazia com dia, mês e ano por extenso", () => {
    const result = formatDateLong("2026-04-03T12:00:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(5);
  });
});

describe("formatCep", () => {
  it("deve formatar CEP com hífen quando tem mais de 5 dígitos", () => {
    expect(formatCep("12345678")).toBe("12345-678");
  });

  it("deve retornar apenas dígitos quando tem 5 ou menos", () => {
    expect(formatCep("12345")).toBe("12345");
  });

  it("deve remover caracteres não numéricos", () => {
    expect(formatCep("12.345-678")).toBe("12345-678");
  });

  it("deve limitar a 8 dígitos", () => {
    expect(formatCep("123456789")).toBe("12345-678");
  });

  it("deve retornar vazio para string vazia", () => {
    expect(formatCep("")).toBe("");
  });
});

describe("truncateText", () => {
  it("deve retornar texto sem modificação se menor ou igual ao limite", () => {
    expect(truncateText("Oi", 10)).toBe("Oi");
    expect(truncateText("Exato", 5)).toBe("Exato");
  });

  it("deve truncar e adicionar ellipsis quando ultrapassa o limite", () => {
    const result = truncateText("Texto muito longo mesmo", 10);
    expect(result).toHaveLength(11); 
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("getInitials", () => {
  it("deve retornar as iniciais das duas primeiras palavras", () => {
    expect(getInitials("João Silva")).toBe("JS");
  });

  it("deve retornar apenas a inicial quando há um único nome", () => {
    expect(getInitials("João")).toBe("J");
  });

  it("deve ignorar espaços extras", () => {
    expect(getInitials("  João   Silva  ")).toBe("JS");
  });

  it("deve lidar com strings vazias", () => {
    expect(getInitials("")).toBe("");
  });

  it("deve usar maiúscula para cada inicial", () => {
    expect(getInitials("ana costa")).toBe("AC");
  });
});

describe("formatCnpjInput", () => {
  it("deve formatar CNPJ completo como XX.XXX.XXX/XXXX-XX", () => {
    expect(formatCnpjInput("00108217011154")).toBe("00.108.217/0111-54");
  });

  it("deve aplicar máscara parcialmente enquanto o usuário digita", () => {
    expect(formatCnpjInput("001")).toBe("00.1");
    expect(formatCnpjInput("00108")).toBe("00.108");
    expect(formatCnpjInput("00108217")).toBe("00.108.217");
    expect(formatCnpjInput("001082170111")).toBe("00.108.217/0111");
  });

  it("deve ignorar caracteres não numéricos na entrada", () => {
    expect(formatCnpjInput("00.108.217/0111-54")).toBe("00.108.217/0111-54");
  });

  it("deve limitar a 14 dígitos", () => {
    expect(formatCnpjInput("001082170111541234")).toBe("00.108.217/0111-54");
  });

  it("deve retornar vazio para string vazia", () => {
    expect(formatCnpjInput("")).toBe("");
  });
});

describe("cleanCnpj", () => {
  it("deve remover pontuação e retornar apenas os 14 dígitos", () => {
    expect(cleanCnpj("00.108.217/0111-54")).toBe("00108217011154");
  });

  it("deve retornar a string como está se já estiver limpa", () => {
    expect(cleanCnpj("00108217011154")).toBe("00108217011154");
  });

  it("deve limitar a 14 dígitos", () => {
    expect(cleanCnpj("001082170111541234")).toBe("00108217011154");
  });

  it("deve retornar vazio para string vazia", () => {
    expect(cleanCnpj("")).toBe("");
  });
});
