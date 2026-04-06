import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    this.client = new PrismaClient({ adapter });
  }

  get user(): PrismaClient["user"] {
    return this.client.user;
  }

  get church(): PrismaClient["church"] {
    return this.client.church;
  }

  get churchMember(): PrismaClient["churchMember"] {
    return this.client.churchMember;
  }

  get post(): PrismaClient["post"] {
    return this.client.post;
  }

  get postLike(): PrismaClient["postLike"] {
    return this.client.postLike;
  }

  get comment(): PrismaClient["comment"] {
    return this.client.comment;
  }

  get commentLike(): PrismaClient["commentLike"] {
    return this.client.commentLike;
  }

  get churchSchedule(): PrismaClient["churchSchedule"] {
    return this.client.churchSchedule;
  }

  get churchEvent(): PrismaClient["churchEvent"] {
    return this.client.churchEvent;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
