import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
type PostStatus = "PENDING" | "APPROVED" | "REJECTED";
import { PaginatedResponse, PaginationParams } from "../types";

const POST_SELECT = {
  id: true,
  title: true,
  content: true,
  imageUrl: true,
  status: true,
  churchId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: { id: true, name: true, avatarUrl: true },
  },
  church: {
    select: { id: true, name: true, logoUrl: true },
  },
  _count: {
    select: { likes: true, comments: true },
  },
};

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private async isAnyChurchAdmin(userId: string): Promise<boolean> {
    const ownedChurch = await this.prisma.church.findFirst({
      where: { adminId: userId },
      select: { id: true },
    });
    if (ownedChurch) return true;
    const membership = await this.prisma.churchMember.findFirst({
      where: { userId, role: "ADMIN", status: "ACTIVE" },
      select: { id: true },
    });
    return !!membership;
  }

  private async isChurchAdmin(churchId: string, userId: string): Promise<boolean> {
    const church = await this.prisma.church.findUnique({
      where: { id: churchId },
      select: { adminId: true },
    });
    if (!church) return false;
    if (church.adminId === userId) return true;

    const membership = await this.prisma.churchMember.findUnique({
      where: { userId_churchId: { userId, churchId } },
      select: { role: true, status: true },
    });
    return membership?.role === "ADMIN" && membership.status === "ACTIVE";
  }

  async create(dto: CreatePostDto, authorId: string) {
    let status: PostStatus = "PENDING";

    if (dto.churchId) {
      const isAdmin = await this.isChurchAdmin(dto.churchId, authorId);
      if (isAdmin) status = "APPROVED";
    } else {
      const isAnyAdmin = await this.isAnyChurchAdmin(authorId);
      if (isAnyAdmin) status = "APPROVED";
    }

    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        imageUrl: dto.imageUrl,
        churchId: dto.churchId,
        authorId,
        status,
      },
      select: POST_SELECT,
    });
  }

  async findAll(params: PaginationParams, churchId?: string): Promise<PaginatedResponse<unknown>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = {
      status: "APPROVED" as PostStatus,
      churchId: churchId ?? null,
    };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: POST_SELECT,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPending(
    params: PaginationParams,
    churchId: string | undefined,
    requesterId: string,
  ): Promise<PaginatedResponse<unknown>> {
    if (churchId) {
      const isAdmin = await this.isChurchAdmin(churchId, requesterId);
      if (!isAdmin) {
        throw new ForbiddenException("Apenas administradores podem ver posts pendentes");
      }
    } else {
      const isAnyAdmin = await this.isAnyChurchAdmin(requesterId);
      if (!isAnyAdmin) {
        throw new ForbiddenException("Apenas administradores podem ver posts pendentes");
      }
    }

    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const where = { status: "PENDING" as PostStatus, churchId: churchId ?? null };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: POST_SELECT,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        ...POST_SELECT,
        comments: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { likes: true } },
          },
        },
      },
    });

    if (!post) throw new NotFoundException("Post não encontrado");

    let likedByMe = false;
    if (userId) {
      const like = await this.prisma.postLike.findUnique({
        where: { postId_userId: { postId: id, userId } },
      });
      likedByMe = !!like;
    }

    return { ...post, likedByMe };
  }

  async update(id: string, dto: UpdatePostDto, requesterId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true, churchId: true },
    });
    if (!post) throw new NotFoundException("Post não encontrado");

    const isAuthor = post.authorId === requesterId;
    const isAdmin = post.churchId ? await this.isChurchAdmin(post.churchId, requesterId) : false;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException("Sem permissão para editar este post");
    }

    return this.prisma.post.update({
      where: { id },
      data: { title: dto.title, content: dto.content, imageUrl: dto.imageUrl },
      select: POST_SELECT,
    });
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true, churchId: true },
    });
    if (!post) throw new NotFoundException("Post não encontrado");

    const isAuthor = post.authorId === requesterId;
    const isAdmin = post.churchId ? await this.isChurchAdmin(post.churchId, requesterId) : false;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException("Sem permissão para excluir este post");
    }

    await this.prisma.post.delete({ where: { id } });
  }

  async approve(id: string, requesterId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { churchId: true, status: true },
    });
    if (!post) throw new NotFoundException("Post não encontrado");

    if (post.churchId) {
      const isAdmin = await this.isChurchAdmin(post.churchId, requesterId);
      if (!isAdmin)
        throw new ForbiddenException("Apenas administradores desta igreja podem aprovar posts");
    } else {
      const isAnyAdmin = await this.isAnyChurchAdmin(requesterId);
      if (!isAnyAdmin)
        throw new ForbiddenException("Apenas administradores podem aprovar posts gerais");
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: "APPROVED" },
      select: POST_SELECT,
    });
  }

  async reject(id: string, requesterId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { churchId: true },
    });
    if (!post) throw new NotFoundException("Post não encontrado");

    if (post.churchId) {
      const isAdmin = await this.isChurchAdmin(post.churchId, requesterId);
      if (!isAdmin)
        throw new ForbiddenException("Apenas administradores desta igreja podem rejeitar posts");
    } else {
      const isAnyAdmin = await this.isAnyChurchAdmin(requesterId);
      if (!isAnyAdmin)
        throw new ForbiddenException("Apenas administradores podem rejeitar posts gerais");
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: "REJECTED" },
      select: POST_SELECT,
    });
  }

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException("Post não encontrado");

    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.postLike.delete({
        where: { postId_userId: { postId, userId } },
      });
    } else {
      await this.prisma.postLike.create({ data: { postId, userId } });
    }

    const count = await this.prisma.postLike.count({ where: { postId } });
    return { liked: !existing, count };
  }

  async getComments(postId: string, params: PaginationParams) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException("Post não encontrado");

    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { likes: true } },
        },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addComment(postId: string, content: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException("Post não encontrado");

    return this.prisma.comment.create({
      data: { content, postId, authorId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true } },
      },
    });
  }

  async removeComment(commentId: string, requesterId: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, post: { select: { churchId: true } } },
    });
    if (!comment) throw new NotFoundException("Comentário não encontrado");

    const isAuthor = comment.authorId === requesterId;
    const isAdmin = comment.post.churchId
      ? await this.isChurchAdmin(comment.post.churchId, requesterId)
      : false;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException("Sem permissão para excluir este comentário");
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
  }

  async toggleCommentLike(
    commentId: string,
    userId: string,
  ): Promise<{ liked: boolean; count: number }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException("Comentário não encontrado");

    const existing = await this.prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing) {
      await this.prisma.commentLike.delete({
        where: { commentId_userId: { commentId, userId } },
      });
    } else {
      await this.prisma.commentLike.create({ data: { commentId, userId } });
    }

    const count = await this.prisma.commentLike.count({ where: { commentId } });
    return { liked: !existing, count };
  }
}
