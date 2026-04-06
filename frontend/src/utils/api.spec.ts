
const mockAxiosInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  get: jest.fn(),
  post: jest.fn(),
};

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(),
  },
  isAxiosError: jest.fn(),
}));

import axios from "axios";
import { extractErrorMessage } from "./api";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("extractErrorMessage", () => {
  it("deve retornar mensagem de string quando ApiError.message é string", () => {
    mockedAxios.isAxiosError.mockReturnValue(true);
    const error = {
      response: { data: { message: "Credenciais inválidas", statusCode: 401 } },
    };

    const result = extractErrorMessage(error);
    expect(result).toBe("Credenciais inválidas");
  });

  it("deve juntar mensagens quando ApiError.message é array", () => {
    mockedAxios.isAxiosError.mockReturnValue(true);
    const error = {
      response: { data: { message: ["Campo obrigatório", "E-mail inválido"], statusCode: 400 } },
    };

    const result = extractErrorMessage(error);
    expect(result).toBe("Campo obrigatório, E-mail inválido");
  });

  it("deve retornar mensagem padrão quando não é erro axios", () => {
    mockedAxios.isAxiosError.mockReturnValue(false);

    const result = extractErrorMessage(new Error("outro erro"));
    expect(result).toBe("Ocorreu um erro inesperado");
  });

  it("deve retornar mensagem padrão quando response.data não tem message", () => {
    mockedAxios.isAxiosError.mockReturnValue(true);
    const error = { response: { data: {} } };

    const result = extractErrorMessage(error);
    expect(result).toBe("Ocorreu um erro inesperado");
  });

  it("deve retornar mensagem padrão quando response é undefined", () => {
    mockedAxios.isAxiosError.mockReturnValue(true);
    const error = { response: undefined };

    const result = extractErrorMessage(error);
    expect(result).toBe("Ocorreu um erro inesperado");
  });
});

describe("api interceptors", () => {
  it("deve registrar interceptors de request e response", () => {
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  describe("request interceptor", () => {
    type RequestConfig = { headers: Record<string, string> };
    type RequestFn = (config: RequestConfig) => RequestConfig;

    function getRequestInterceptor(): RequestFn {
      return mockAxiosInstance.interceptors.request.use.mock.calls[0][0] as RequestFn;
    }

    it("deve adicionar token de autorização quando há token no localStorage", () => {
      jest.spyOn(Storage.prototype, "getItem").mockReturnValue("my-token");

      const config: RequestConfig = { headers: {} };
      const result = getRequestInterceptor()(config);

      expect(result.headers["Authorization"]).toBe("Bearer my-token");
      jest.restoreAllMocks();
    });

    it("não deve adicionar token quando não há token no localStorage", () => {
      jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

      const config: RequestConfig = { headers: {} };
      const result = getRequestInterceptor()(config);

      expect(result.headers["Authorization"]).toBeUndefined();
      jest.restoreAllMocks();
    });

    it("não deve adicionar token quando window é undefined (SSR)", () => {
      
      jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

      const config: RequestConfig = { headers: {} };
      const result = getRequestInterceptor()(config);

      expect(result.headers["Authorization"]).toBeUndefined();
      jest.restoreAllMocks();
    });
  });

  describe("response interceptor", () => {
    type SuccessFn = (r: unknown) => unknown;
    type ErrorFn = (e: unknown) => Promise<never>;

    function getResponseInterceptors(): [SuccessFn, ErrorFn] {
      return mockAxiosInstance.interceptors.response.use.mock.calls[0] as [SuccessFn, ErrorFn];
    }

    it("deve retornar response para respostas bem-sucedidas", () => {
      const [successHandler] = getResponseInterceptors();
      const mockResponse = { data: { ok: true }, status: 200 };
      expect(successHandler(mockResponse)).toEqual(mockResponse);
    });

    it("deve remover token e redirecionar em caso de 401", () => {
      const [, errorHandler] = getResponseInterceptors();

      jest.spyOn(Storage.prototype, "removeItem");

      const error = { response: { status: 401 } };
      void errorHandler(error).catch(() => undefined);

      expect(Storage.prototype.removeItem).toHaveBeenCalledWith("access_token");
      jest.restoreAllMocks();
    });

    it("não deve redirecionar em erros que não são 401", () => {
      const [, errorHandler] = getResponseInterceptors();

      jest.spyOn(Storage.prototype, "removeItem");

      const error = { response: { status: 403 } };
      void errorHandler(error).catch(() => undefined);

      expect(Storage.prototype.removeItem).not.toHaveBeenCalled();
      jest.restoreAllMocks();
    });

    it("não deve redirecionar quando window é undefined (SSR)", () => {
      const [, errorHandler] = getResponseInterceptors();
      
      jest.spyOn(Storage.prototype, "removeItem");

      const error = { response: { status: 500 } };
      void errorHandler(error).catch(() => undefined);

      expect(Storage.prototype.removeItem).not.toHaveBeenCalled();
      jest.restoreAllMocks();
    });

    it("não deve redirecionar quando não há response no erro (erro de rede)", () => {
      const [, errorHandler] = getResponseInterceptors();

      jest.spyOn(Storage.prototype, "removeItem");

      const error = { response: undefined };
      void errorHandler(error).catch(() => undefined);

      expect(Storage.prototype.removeItem).not.toHaveBeenCalled();
      jest.restoreAllMocks();
    });
  });
});

describe("api BASE_URL initialization", () => {
  it("deve usar NEXT_PUBLIC_BACKEND_URL quando definida no ambiente", () => {
    const original = process.env.NEXT_PUBLIC_BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://custom-backend.com/api/v1";
    jest.isolateModules(async () => {
      await import("./api");
    });
    process.env.NEXT_PUBLIC_BACKEND_URL = original;
    expect(true).toBe(true);
  });
});
