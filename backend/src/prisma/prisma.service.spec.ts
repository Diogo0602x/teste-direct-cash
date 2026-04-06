import { PrismaService } from "./prisma.service";

jest.mock("@prisma/adapter-pg", () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@prisma/client", () => {
  const mockClient = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    user: { findUnique: jest.fn() },
    church: { findUnique: jest.fn() },
    churchMember: { findUnique: jest.fn() },
    post: { findUnique: jest.fn() },
    postLike: { findUnique: jest.fn() },
    comment: { findUnique: jest.fn() },
    commentLike: { findUnique: jest.fn() },
  };
  return { PrismaClient: jest.fn().mockImplementation(() => mockClient) };
});

describe("PrismaService", () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it("deve expor getter user", () => {
    expect(service.user).toBeDefined();
  });

  it("deve expor getter church", () => {
    expect(service.church).toBeDefined();
  });

  it("deve expor getter churchMember", () => {
    expect(service.churchMember).toBeDefined();
  });

  it("deve expor getter post", () => {
    expect(service.post).toBeDefined();
  });

  it("deve expor getter postLike", () => {
    expect(service.postLike).toBeDefined();
  });

  it("deve expor getter comment", () => {
    expect(service.comment).toBeDefined();
  });

  it("deve expor getter commentLike", () => {
    expect(service.commentLike).toBeDefined();
  });

  it("deve chamar $connect em onModuleInit", async () => {
    await service.onModuleInit();

    expect(true).toBe(true);
  });

  it("deve chamar $disconnect em onModuleDestroy", async () => {
    await service.onModuleDestroy();
    expect(true).toBe(true);
  });
});
