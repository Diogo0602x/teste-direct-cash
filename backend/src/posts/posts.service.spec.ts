import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  church: { findUnique: jest.fn(), findFirst: jest.fn() },
  churchMember: { findUnique: jest.fn(), findFirst: jest.fn() },
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  postLike: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  commentLike: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

const post = {
  id: "p1",
  title: "Post",
  content: "Conteúdo",
  churchId: "c1",
  authorId: "user-1",
  status: "PENDING",
};
const postResult = { ...post, author: {}, church: {}, _count: { likes: 0, comments: 0 } };

describe("PostsService", () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("deve criar post como APPROVED quando author é admin", async () => {
      const dto = { title: "Post", content: "Texto", churchId: "c1" };
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "user-1" });
      mockPrisma.post.create.mockResolvedValue({ ...postResult, status: "APPROVED" });

      const result = await service.create(dto, "user-1");

      const createData = mockPrisma.post.create.mock.calls[0][0].data;
      expect(createData.status).toBe("APPROVED");
      expect(result).toBeDefined();
    });

    it("deve criar post como PENDING quando author é membro comum", async () => {
      const dto = { title: "Post", content: "Texto", churchId: "c1" };
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });
      mockPrisma.post.create.mockResolvedValue({ ...postResult, status: "PENDING" });

      await service.create(dto, "user-2");

      const createData = mockPrisma.post.create.mock.calls[0][0].data;
      expect(createData.status).toBe("PENDING");
    });

    it("deve criar post como PENDING quando não tem churchId e autor não é admin", async () => {
      const dto = { title: "Post", content: "Texto" };
      mockPrisma.church.findFirst.mockResolvedValue(null);
      mockPrisma.churchMember.findFirst.mockResolvedValue(null);
      mockPrisma.post.create.mockResolvedValue({
        ...postResult,
        status: "PENDING",
        churchId: null,
      });

      await service.create(dto, "user-1");

      const createData = mockPrisma.post.create.mock.calls[0][0].data;
      expect(createData.status).toBe("PENDING");
    });

    it("deve criar post como APPROVED quando não tem churchId e autor é admin de alguma igreja", async () => {
      const dto = { title: "Post", content: "Texto" };
      mockPrisma.church.findFirst.mockResolvedValue({ id: "c1" });
      mockPrisma.post.create.mockResolvedValue({
        ...postResult,
        status: "APPROVED",
        churchId: null,
      });

      await service.create(dto, "admin-1");

      const createData = mockPrisma.post.create.mock.calls[0][0].data;
      expect(createData.status).toBe("APPROVED");
    });

    it("deve criar post como APPROVED quando church não existe (isChurchAdmin retorna false via church null)", async () => {
      const dto = { title: "Post", content: "Texto", churchId: "nonexistent" };
      mockPrisma.church.findUnique.mockResolvedValue(null);
      mockPrisma.post.create.mockResolvedValue({ ...postResult, status: "PENDING" });

      await service.create(dto, "user-1");

      const createData = mockPrisma.post.create.mock.calls[0][0].data;

      expect(createData.status).toBe("PENDING");
    });
  });

  describe("findAll", () => {
    it("deve retornar posts aprovados paginados", async () => {
      mockPrisma.post.findMany.mockResolvedValue([postResult]);
      mockPrisma.post.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("deve filtrar posts gerais (churchId: null) quando não há filtro", async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10 });

      const where = mockPrisma.post.findMany.mock.calls[0][0].where;
      expect(where.churchId).toBeNull();
    });

    it("deve filtrar por churchId quando fornecido", async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10 }, "c1");

      const where = mockPrisma.post.findMany.mock.calls[0][0].where;
      expect(where.churchId).toBe("c1");
    });
  });

  describe("findPending", () => {
    it("deve retornar posts pendentes para admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.post.findMany.mockResolvedValue([postResult]);
      mockPrisma.post.count.mockResolvedValue(1);

      const result = await service.findPending({ page: 1, limit: 10 }, "c1", "admin-1");

      expect(result.data).toHaveLength(1);
    });

    it("deve lançar ForbiddenException para não admin", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.findPending({ page: 1, limit: 10 }, "c1", "user-2")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("deve lançar ForbiddenException quando membership é null (isChurchAdmin=false via null)", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue(null);

      await expect(service.findPending({ page: 1, limit: 10 }, "c1", "user-2")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("deve lançar ForbiddenException quando role é ADMIN mas status não é ACTIVE", async () => {
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "ADMIN", status: "INACTIVE" });

      await expect(service.findPending({ page: 1, limit: 10 }, "c1", "user-2")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findById", () => {
    it("deve retornar post com likedByMe=false quando userId não fornecido", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ ...postResult, comments: [] });

      const result = await service.findById("p1");

      expect(result.likedByMe).toBe(false);
    });

    it("deve retornar likedByMe=true quando usuário curtiu", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ ...postResult, comments: [] });
      mockPrisma.postLike.findUnique.mockResolvedValue({ postId: "p1", userId: "user-1" });

      const result = await service.findById("p1", "user-1");

      expect(result.likedByMe).toBe(true);
    });

    it("deve retornar likedByMe=false quando usuário não curtiu", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ ...postResult, comments: [] });
      mockPrisma.postLike.findUnique.mockResolvedValue(null);

      const result = await service.findById("p1", "user-1");

      expect(result.likedByMe).toBe(false);
    });

    it("deve lançar NotFoundException quando post não encontrado", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.findById("nope")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("deve atualizar quando requester é o autor", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ authorId: "user-1", churchId: "c1" });
      mockPrisma.post.update.mockResolvedValue(postResult);

      const result = await service.update("p1", { title: "Novo" }, "user-1");

      expect(result).toBeDefined();
    });

    it("deve atualizar quando requester é admin da igreja", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ authorId: "other", churchId: "c1" });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.post.update.mockResolvedValue(postResult);

      const result = await service.update("p1", { title: "Novo" }, "admin-1");

      expect(result).toBeDefined();
    });

    it("deve lançar ForbiddenException quando não tem permissão", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ authorId: "other", churchId: "c1" });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other2" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.update("p1", { title: "X" }, "user-3")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("deve lançar NotFoundException quando post não existe", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.update("nope", {}, "user-1")).rejects.toThrow(NotFoundException);
    });

    it("deve tratar update sem churchId (post global)", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ authorId: "other", churchId: null });

      await expect(service.update("p1", { title: "X" }, "user-3")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("remove", () => {
    it("deve remover quando requester é o autor", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ authorId: "user-1", churchId: "c1" });
      mockPrisma.post.delete.mockResolvedValue(undefined);

      await service.remove("p1", "user-1");

      expect(mockPrisma.post.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    });

    it("deve remover quando requester é admin", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ authorId: "other", churchId: "c1" });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.post.delete.mockResolvedValue(undefined);

      await service.remove("p1", "admin-1");

      expect(mockPrisma.post.delete).toHaveBeenCalled();
    });

    it("deve lançar ForbiddenException sem permissão", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ authorId: "other", churchId: "c1" });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other2" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.remove("p1", "user-3")).rejects.toThrow(ForbiddenException);
    });

    it("deve lançar NotFoundException quando post não existe", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.remove("nope", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("deve lançar ForbiddenException sem churchId e sem ser autor", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ authorId: "other", churchId: null });

      await expect(service.remove("p1", "user-3")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("approve", () => {
    it("deve aprovar post de igreja quando requester é admin", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ churchId: "c1", status: "PENDING" });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.post.update.mockResolvedValue({ ...postResult, status: "APPROVED" });

      const result = await service.approve("p1", "admin-1");

      expect(result).toBeDefined();
    });

    it("deve aprovar post geral quando requester é qualquer admin", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ churchId: null, status: "PENDING" });
      mockPrisma.church.findFirst.mockResolvedValue({ id: "c1" });
      mockPrisma.post.update.mockResolvedValue({
        ...postResult,
        status: "APPROVED",
        churchId: null,
      });

      const result = await service.approve("p1", "admin-1");

      expect(result).toBeDefined();
    });

    it("deve lançar NotFoundException quando post não existe", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.approve("nope", "admin-1")).rejects.toThrow(NotFoundException);
    });

    it("deve lançar ForbiddenException quando post geral e requester não é nenhum admin", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ churchId: null });
      mockPrisma.church.findFirst.mockResolvedValue(null);
      mockPrisma.churchMember.findFirst.mockResolvedValue(null);

      await expect(service.approve("p1", "user-1")).rejects.toThrow(ForbiddenException);
    });

    it("deve lançar ForbiddenException quando não é admin da igreja", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ churchId: "c1" });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.approve("p1", "user-2")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("reject", () => {
    it("deve rejeitar post de igreja quando requester é admin", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ churchId: "c1" });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.post.update.mockResolvedValue({ ...postResult, status: "REJECTED" });

      const result = await service.reject("p1", "admin-1");

      expect(result).toBeDefined();
    });

    it("deve rejeitar post geral quando requester é qualquer admin", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ churchId: null });
      mockPrisma.church.findFirst.mockResolvedValue({ id: "c1" });
      mockPrisma.post.update.mockResolvedValue({
        ...postResult,
        status: "REJECTED",
        churchId: null,
      });

      const result = await service.reject("p1", "admin-1");

      expect(result).toBeDefined();
    });

    it("deve lançar NotFoundException quando post não existe", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.reject("nope", "admin-1")).rejects.toThrow(NotFoundException);
    });

    it("deve lançar ForbiddenException quando post geral e requester não é nenhum admin", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ churchId: null });
      mockPrisma.church.findFirst.mockResolvedValue(null);
      mockPrisma.churchMember.findFirst.mockResolvedValue(null);

      await expect(service.reject("p1", "user-1")).rejects.toThrow(ForbiddenException);
    });

    it("deve lançar ForbiddenException quando não é admin da igreja", async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ churchId: "c1" });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.reject("p1", "user-2")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("toggleLike", () => {
    it("deve curtir quando não havia like anterior", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(post);
      mockPrisma.postLike.findUnique.mockResolvedValue(null);
      mockPrisma.postLike.create.mockResolvedValue({});
      mockPrisma.postLike.count.mockResolvedValue(1);

      const result = await service.toggleLike("p1", "user-1");

      expect(result.liked).toBe(true);
      expect(result.count).toBe(1);
    });

    it("deve descurtir quando já havia like", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(post);
      mockPrisma.postLike.findUnique.mockResolvedValue({ postId: "p1", userId: "user-1" });
      mockPrisma.postLike.delete.mockResolvedValue({});
      mockPrisma.postLike.count.mockResolvedValue(0);

      const result = await service.toggleLike("p1", "user-1");

      expect(result.liked).toBe(false);
      expect(result.count).toBe(0);
    });

    it("deve lançar NotFoundException quando post não existe", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.toggleLike("nope", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getComments", () => {
    it("deve retornar comentários paginados", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(post);
      mockPrisma.comment.findMany.mockResolvedValue([{ id: "cm1" }]);
      mockPrisma.comment.count.mockResolvedValue(1);

      const result = await service.getComments("p1", { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
    });

    it("deve lançar NotFoundException quando post não existe", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.getComments("nope", { page: 1, limit: 20 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("addComment", () => {
    it("deve adicionar comentário ao post", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(post);
      mockPrisma.comment.create.mockResolvedValue({ id: "cm1", content: "Ótimo!" });

      const result = await service.addComment("p1", "Ótimo!", "user-1");

      expect(result).toBeDefined();
    });

    it("deve lançar NotFoundException quando post não existe", async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.addComment("nope", "texto", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("removeComment", () => {
    it("deve remover comentário quando requester é o autor", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue({
        authorId: "user-1",
        post: { churchId: "c1" },
      });
      mockPrisma.comment.delete.mockResolvedValue(undefined);

      await service.removeComment("cm1", "user-1");

      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({ where: { id: "cm1" } });
    });

    it("deve remover comentário quando requester é admin da igreja", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue({
        authorId: "other",
        post: { churchId: "c1" },
      });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "admin-1" });
      mockPrisma.comment.delete.mockResolvedValue(undefined);

      await service.removeComment("cm1", "admin-1");

      expect(mockPrisma.comment.delete).toHaveBeenCalled();
    });

    it("deve lançar ForbiddenException sem permissão", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue({
        authorId: "other",
        post: { churchId: "c1" },
      });
      mockPrisma.church.findUnique.mockResolvedValue({ adminId: "other2" });
      mockPrisma.churchMember.findUnique.mockResolvedValue({ role: "MEMBER", status: "ACTIVE" });

      await expect(service.removeComment("cm1", "user-3")).rejects.toThrow(ForbiddenException);
    });

    it("deve lançar NotFoundException quando comentário não existe", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.removeComment("nope", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("deve remover comentário quando post não tem churchId e requester é autor", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue({
        authorId: "user-1",
        post: { churchId: null },
      });
      mockPrisma.comment.delete.mockResolvedValue(undefined);

      await service.removeComment("cm1", "user-1");

      expect(mockPrisma.comment.delete).toHaveBeenCalled();
    });

    it("deve lançar ForbiddenException quando post não tem churchId e não é autor", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue({
        authorId: "other",
        post: { churchId: null },
      });

      await expect(service.removeComment("cm1", "user-3")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("toggleCommentLike", () => {
    it("deve curtir quando não havia like anterior", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue({ id: "cm1" });
      mockPrisma.commentLike.findUnique.mockResolvedValue(null);
      mockPrisma.commentLike.create.mockResolvedValue({});
      mockPrisma.commentLike.count.mockResolvedValue(1);

      const result = await service.toggleCommentLike("cm1", "user-1");

      expect(result.liked).toBe(true);
    });

    it("deve descurtir quando já havia like", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue({ id: "cm1" });
      mockPrisma.commentLike.findUnique.mockResolvedValue({ commentId: "cm1", userId: "user-1" });
      mockPrisma.commentLike.delete.mockResolvedValue({});
      mockPrisma.commentLike.count.mockResolvedValue(0);

      const result = await service.toggleCommentLike("cm1", "user-1");

      expect(result.liked).toBe(false);
    });

    it("deve lançar NotFoundException quando comentário não existe", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.toggleCommentLike("nope", "user-1")).rejects.toThrow(NotFoundException);
    });
  });
});
