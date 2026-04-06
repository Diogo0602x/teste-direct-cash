import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "@prisma/client";

type SafeUser = Omit<User, "password">;

type AdminChurch = { id: string; name: string } | null;

type UserProfile = SafeUser & { adminChurch: AdminChurch };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyProfile(id: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const ownedChurch = await this.prisma.church.findFirst({
      where: { adminId: id },
      select: { id: true, name: true },
    });

    if (ownedChurch) {
      return { ...user, adminChurch: ownedChurch };
    }

    const membership = await this.prisma.churchMember.findFirst({
      where: { userId: id, role: "ADMIN", status: "ACTIVE" },
      select: { church: { select: { id: true, name: true } } },
    });

    return { ...user, adminChurch: membership?.church ?? null };
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return user;
  }

  async findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      omit: { password: true },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      omit: { password: true },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
