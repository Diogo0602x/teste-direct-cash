import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Carrega .env.seed se existir, senão usa .env principal
const seedEnvPath = path.resolve(__dirname, "..", ".env.seed");
const mainEnvPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: fs.existsSync(seedEnvPath) ? seedEnvPath : mainEnvPath, override: true });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não encontrada. Verifique .env.seed ou .env");
  process.exit(1);
}

// Prisma 7 requer driver adapter explícito (mesmo padrão do PrismaService)
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Admin Igreja";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@igreja.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin@1234";

const USER_NAME = process.env.SEED_USER_NAME ?? "João Fiel";
const USER_EMAIL = process.env.SEED_USER_EMAIL ?? "joao@exemplo.com";
const USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? "Membro@1234";

const CHURCH_NAME = process.env.SEED_CHURCH_NAME ?? "Igreja Nossa Senhora da Paz";
const CHURCH_CNPJ = process.env.SEED_CHURCH_CNPJ ?? "12345678000195";

async function main(): Promise<void> {
  console.log("🌱 Iniciando seed...\n");

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: adminHash,
      bio: "Administrador da igreja.",
    },
  });
  console.log(`✔ Admin criado: ${admin.email}`);

  // ── Igreja ─────────────────────────────────────────────────────────────────
  const church = await prisma.church.upsert({
    where: { cnpj: CHURCH_CNPJ },
    update: {},
    create: {
      name: CHURCH_NAME,
      cnpj: CHURCH_CNPJ,
      description: "Uma comunidade acolhedora e vibrante.",
      city: "São Paulo",
      state: "SP",
      adminId: admin.id,
    },
  });
  console.log(`✔ Igreja criada: ${church.name}`);

  // ── Admin como membro ATIVO com role ADMIN ────────────────────────────────
  await prisma.churchMember.upsert({
    where: { userId_churchId: { userId: admin.id, churchId: church.id } },
    update: {},
    create: {
      userId: admin.id,
      churchId: church.id,
      status: "ACTIVE",
      role: "ADMIN",
    },
  });
  console.log(`✔ Admin vinculado à igreja como membro ADMIN`);

  // ── Usuário normal ─────────────────────────────────────────────────────────
  const userHash = await bcrypt.hash(USER_PASSWORD, SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {},
    create: {
      name: USER_NAME,
      email: USER_EMAIL,
      password: userHash,
      bio: "Membro fiel da comunidade.",
    },
  });
  console.log(`✔ Usuário criado: ${user.email}`);

  // ── Usuário normal como membro ATIVO ──────────────────────────────────────
  await prisma.churchMember.upsert({
    where: { userId_churchId: { userId: user.id, churchId: church.id } },
    update: {},
    create: {
      userId: user.id,
      churchId: church.id,
      status: "ACTIVE",
      role: "MEMBER",
    },
  });
  console.log(`✔ Usuário vinculado à igreja como membro\n`);

  console.log("─".repeat(50));
  console.log("Credenciais de acesso:");
  console.log(`  Admin  → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Membro → ${USER_EMAIL} / ${USER_PASSWORD}`);
  console.log("─".repeat(50));
  console.log("\n✅ Seed concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
