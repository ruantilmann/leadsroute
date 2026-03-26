-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "placeId" VARCHAR(128) NOT NULL,
    "nomeEmpresa" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(64),
    "enderecoCompleto" VARCHAR(512) NOT NULL,
    "numero" VARCHAR(32),
    "rua" VARCHAR(255),
    "bairro" VARCHAR(255),
    "cidade" VARCHAR(120) NOT NULL,
    "estado" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_placeId_key" ON "Lead"("placeId");

-- CreateIndex
CREATE INDEX "Lead_cidade_idx" ON "Lead"("cidade");
