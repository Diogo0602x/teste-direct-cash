import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChurchDto } from "./dto/create-church.dto";
import { UpdateChurchDto } from "./dto/update-church.dto";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { CreateEventDto } from "./dto/create-event.dto";
import { MemberRole } from "@prisma/client";
import { PaginatedResponse, PaginationParams } from "../types";

type CnpjApiResponse = {
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  municipio: string;
  uf: string;
  cep?: string;
};

@Injectable()
export class ChurchesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertSingleAdmin(userId: string, excludeChurchId?: string): Promise<void> {
    const ownedChurch = await this.prisma.church.findFirst({
      where: {
        adminId: userId,
        ...(excludeChurchId ? { id: { not: excludeChurchId } } : {}),
      },
      select: { name: true },
    });
    if (ownedChurch) {
      throw new ConflictException(
        `Usuário já é administrador de outra igreja (${ownedChurch.name})`,
      );
    }
    const adminMembership = await this.prisma.churchMember.findFirst({
      where: {
        userId,
        role: "ADMIN",
        status: "ACTIVE",
        ...(excludeChurchId ? { churchId: { not: excludeChurchId } } : {}),
      },
      select: { church: { select: { name: true } } },
    });
    if (adminMembership) {
      throw new ConflictException(
        `Usuário já é administrador de outra igreja (${adminMembership.church.name})`,
      );
    }
  }

  private async assertAdmin(churchId: string, userId: string): Promise<void> {
    const church = await this.prisma.church.findUnique({
      where: { id: churchId },
      select: { adminId: true },
    });
    if (!church) throw new NotFoundException("Igreja não encontrada");

    if (church.adminId === userId) return;

    const membership = await this.prisma.churchMember.findUnique({
      where: { userId_churchId: { userId, churchId } },
      select: { role: true, status: true },
    });
    if (membership?.role !== "ADMIN" || membership.status !== "ACTIVE") {
      throw new ForbiddenException("Apenas administradores podem realizar esta ação");
    }
  }

  private validateCnpjDigits(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    const calcDigit = (slice: string, weights: number[]): number => {
      const sum = slice
        .split("")
        .reduce((acc, char, i) => acc + parseInt(char) * (weights[i] ?? 0), 0);
      const rem = sum % 11;
      return rem < 2 ? 0 : 11 - rem;
    };

    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    return (
      parseInt(cnpj[12] ?? "x") === calcDigit(cnpj.slice(0, 12), w1) &&
      parseInt(cnpj[13] ?? "x") === calcDigit(cnpj.slice(0, 13), w2)
    );
  }

  private formatCnpj(cnpj: string): string {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }

  async lookupCnpj(rawCnpj: string) {
    const cnpj = rawCnpj.replace(/\D/g, "");

    if (!this.validateCnpjDigits(cnpj)) {
      throw new BadRequestException("CNPJ inválido");
    }

    const existing = await this.prisma.church.findUnique({
      where: { cnpj },
      select: { id: true, name: true },
    });
    if (existing) {
      throw new ConflictException("Este CNPJ já está cadastrado como igreja na plataforma");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    let res: Response;
    try {
      res = await fetch(`https://api.opencnpj.org/${cnpj}`, {
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === "AbortError";
      throw new BadRequestException(
        isAbort
          ? "Tempo de resposta excedido ao consultar a Receita Federal. Tente novamente."
          : "Não foi possível conectar à Receita Federal. Verifique sua conexão e tente novamente.",
      );
    }
    clearTimeout(timeoutId);

    if (res.status === 404 || res.status === 400) {
      throw new NotFoundException("CNPJ não encontrado na base da Receita Federal.");
    }

    if (res.status === 429) {
      throw new BadRequestException(
        "Muitas requisições à Receita Federal. Aguarde alguns segundos e tente novamente.",
      );
    }

    if (!res.ok) {
      throw new BadRequestException(
        `Serviço da Receita Federal indisponível (${res.status}). Tente novamente em instantes.`,
      );
    }

    let apiData: CnpjApiResponse;
    try {
      apiData = (await res.json()) as CnpjApiResponse;
    } catch {
      throw new BadRequestException("Resposta inválida da Receita Federal. Tente novamente.");
    }

    const situacao = apiData.situacao_cadastral?.trim() ?? "";
    if (situacao.toLowerCase() !== "ativa") {
      throw new BadRequestException(
        `Este CNPJ está com situação cadastral ${situacao || "DESCONHECIDA"}. Apenas CNPJs ATIVOS podem ser cadastrados.`,
      );
    }

    const nomeFantasia = apiData.nome_fantasia?.trim() || null;
    return {
      cnpj,
      cnpjFormatted: this.formatCnpj(cnpj),
      razaoSocial: apiData.razao_social,
      nomeFantasia,
      name: nomeFantasia || apiData.razao_social,
      city: apiData.municipio,
      state: apiData.uf,
      zipCode: apiData.cep?.replace(/\D/g, "") || null,
    };
  }

  async create(dto: CreateChurchDto, adminId: string) {
    await this.assertSingleAdmin(adminId);
    const cnpjData = await this.lookupCnpj(dto.cnpj);

    const church = await this.prisma.church.create({
      data: {
        cnpj: cnpjData.cnpj,
        cnpjRazaoSocial: cnpjData.razaoSocial,
        cnpjNomeFantasia: cnpjData.nomeFantasia,
        name: cnpjData.name,
        description: dto.description,
        city: cnpjData.city,
        state: cnpjData.state,
        zipCode: cnpjData.zipCode ?? undefined,
        website: dto.website,
        adminId,
      },
    });

    await this.prisma.churchMember.create({
      data: {
        userId: adminId,
        churchId: church.id,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    return church;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResponse<unknown>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.church.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { members: true, posts: true } },
        },
      }),
      this.prisma.church.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const church = await this.prisma.church.findUnique({
      where: { id },
      include: {
        admin: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        _count: { select: { members: true, posts: true } },
      },
    });

    if (!church) throw new NotFoundException("Igreja não encontrada");
    return church;
  }

  async update(id: string, dto: UpdateChurchDto, requesterId: string) {
    await this.assertAdmin(id, requesterId);
    return this.prisma.church.update({ where: { id }, data: dto });
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const church = await this.findById(id);
    if (church.adminId !== requesterId) {
      throw new ForbiddenException("Apenas o criador da igreja pode excluí-la");
    }
    await this.prisma.church.delete({ where: { id } });
  }

  async requestJoin(churchId: string, userId: string) {
    await this.findById(churchId);

    const existing = await this.prisma.churchMember.findUnique({
      where: { userId_churchId: { userId, churchId } },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        throw new ConflictException("Você já é membro desta igreja");
      }
      if (existing.status === "PENDING") {
        throw new ConflictException("Solicitação já enviada, aguarde aprovação");
      }
      if (existing.status === "REJECTED") {
        return this.prisma.churchMember.update({
          where: { userId_churchId: { userId, churchId } },
          data: { status: "PENDING" },
          select: this.memberSelect(),
        });
      }
    }

    return this.prisma.churchMember.create({
      data: { userId, churchId, role: "MEMBER", status: "PENDING" },
      select: this.memberSelect(),
    });
  }

  async getMembers(churchId: string, params: PaginationParams) {
    await this.findById(churchId);
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.churchMember.findMany({
        where: { churchId, status: "ACTIVE" },
        skip,
        take: limit,
        orderBy: { joinedAt: "asc" },
        select: this.memberSelect(),
      }),
      this.prisma.churchMember.count({ where: { churchId, status: "ACTIVE" } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPendingRequests(churchId: string, requesterId: string) {
    await this.assertAdmin(churchId, requesterId);

    return this.prisma.churchMember.findMany({
      where: { churchId, status: "PENDING" },
      orderBy: { joinedAt: "asc" },
      select: this.memberSelect(),
    });
  }

  async approveMember(churchId: string, userId: string, requesterId: string) {
    await this.assertAdmin(churchId, requesterId);

    const member = await this.prisma.churchMember.findUnique({
      where: { userId_churchId: { userId, churchId } },
    });
    if (!member) throw new NotFoundException("Solicitação não encontrada");

    return this.prisma.churchMember.update({
      where: { userId_churchId: { userId, churchId } },
      data: { status: "ACTIVE" },
      select: this.memberSelect(),
    });
  }

  async rejectMember(churchId: string, userId: string, requesterId: string) {
    await this.assertAdmin(churchId, requesterId);

    const member = await this.prisma.churchMember.findUnique({
      where: { userId_churchId: { userId, churchId } },
    });
    if (!member) throw new NotFoundException("Solicitação não encontrada");

    return this.prisma.churchMember.update({
      where: { userId_churchId: { userId, churchId } },
      data: { status: "REJECTED" },
      select: this.memberSelect(),
    });
  }

  async updateMemberRole(churchId: string, userId: string, role: MemberRole, requesterId: string) {
    const church = await this.findById(churchId);
    if (church.adminId !== requesterId) {
      throw new ForbiddenException("Apenas o criador da igreja pode alterar papéis");
    }

    const member = await this.prisma.churchMember.findUnique({
      where: { userId_churchId: { userId, churchId } },
    });
    if (!member || member.status !== "ACTIVE") {
      throw new NotFoundException("Membro não encontrado");
    }

    if (role === "ADMIN") {
      await this.assertSingleAdmin(userId, churchId);
    }

    return this.prisma.churchMember.update({
      where: { userId_churchId: { userId, churchId } },
      data: { role },
      select: this.memberSelect(),
    });
  }

  async removeMember(churchId: string, userId: string, requesterId: string): Promise<void> {
    await this.assertAdmin(churchId, requesterId);

    const member = await this.prisma.churchMember.findUnique({
      where: { userId_churchId: { userId, churchId } },
    });
    if (!member) throw new NotFoundException("Membro não encontrado");

    await this.prisma.churchMember.delete({
      where: { userId_churchId: { userId, churchId } },
    });
  }

  async addAdminByEmail(churchId: string, email: string, requesterId: string) {
    await this.assertAdmin(churchId, requesterId);

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
    if (!user) throw new NotFoundException("Usuário não encontrado com este e-mail");

    await this.assertSingleAdmin(user.id, churchId);

    const existing = await this.prisma.churchMember.findUnique({
      where: { userId_churchId: { userId: user.id, churchId } },
    });

    if (existing) {
      if (existing.role === "ADMIN" && existing.status === "ACTIVE") {
        throw new ConflictException("Este usuário já é administrador desta igreja");
      }
      return this.prisma.churchMember.update({
        where: { userId_churchId: { userId: user.id, churchId } },
        data: { role: "ADMIN", status: "ACTIVE" },
        select: this.memberSelect(),
      });
    }

    return this.prisma.churchMember.create({
      data: { userId: user.id, churchId, role: "ADMIN", status: "ACTIVE" },
      select: this.memberSelect(),
    });
  }

  private memberSelect() {
    return {
      id: true,
      role: true,
      status: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    };
  }

  async getSchedules(churchId: string) {
    await this.findById(churchId);
    return this.prisma.churchSchedule.findMany({
      where: { churchId },
      orderBy: [{ time: "asc" }],
    });
  }

  async createSchedule(churchId: string, dto: CreateScheduleDto, requesterId: string) {
    await this.assertAdmin(churchId, requesterId);
    return this.prisma.churchSchedule.create({
      data: { ...dto, churchId },
    });
  }

  async updateSchedule(
    churchId: string,
    scheduleId: string,
    dto: Partial<CreateScheduleDto>,
    requesterId: string,
  ) {
    await this.assertAdmin(churchId, requesterId);
    const schedule = await this.prisma.churchSchedule.findFirst({
      where: { id: scheduleId, churchId },
    });
    if (!schedule) throw new NotFoundException("Horário não encontrado");
    return this.prisma.churchSchedule.update({
      where: { id: scheduleId },
      data: dto,
    });
  }

  async deleteSchedule(churchId: string, scheduleId: string, requesterId: string): Promise<void> {
    await this.assertAdmin(churchId, requesterId);
    const schedule = await this.prisma.churchSchedule.findFirst({
      where: { id: scheduleId, churchId },
    });
    if (!schedule) throw new NotFoundException("Horário não encontrado");
    await this.prisma.churchSchedule.delete({ where: { id: scheduleId } });
  }

  async getEvents(churchId: string) {
    await this.findById(churchId);
    return this.prisma.churchEvent.findMany({
      where: { churchId },
      orderBy: { startDate: "asc" },
    });
  }

  async createEvent(churchId: string, dto: CreateEventDto, requesterId: string) {
    await this.assertAdmin(churchId, requesterId);
    return this.prisma.churchEvent.create({
      data: {
        churchId,
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async updateEvent(
    churchId: string,
    eventId: string,
    dto: Partial<CreateEventDto>,
    requesterId: string,
  ) {
    await this.assertAdmin(churchId, requesterId);
    const event = await this.prisma.churchEvent.findFirst({ where: { id: eventId, churchId } });
    if (!event) throw new NotFoundException("Evento não encontrado");
    return this.prisma.churchEvent.update({
      where: { id: eventId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
    });
  }

  async deleteEvent(churchId: string, eventId: string, requesterId: string): Promise<void> {
    await this.assertAdmin(churchId, requesterId);
    const event = await this.prisma.churchEvent.findFirst({ where: { id: eventId, churchId } });
    if (!event) throw new NotFoundException("Evento não encontrado");
    await this.prisma.churchEvent.delete({ where: { id: eventId } });
  }
}
