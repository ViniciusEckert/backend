-- CreateTable
CREATE TABLE "Alunos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "cpf" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Alunos_cpf_key" ON "Alunos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Alunos_email_key" ON "Alunos"("email");
