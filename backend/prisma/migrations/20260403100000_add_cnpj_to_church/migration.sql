-- AlterTable
ALTER TABLE "churches" ADD COLUMN "cnpj" TEXT;
ALTER TABLE "churches" ADD COLUMN "cnpjRazaoSocial" TEXT;
ALTER TABLE "churches" ADD COLUMN "cnpjNomeFantasia" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "churches_cnpj_key" ON "churches"("cnpj");
