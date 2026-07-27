-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_nascimento" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Agencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "endereco" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Conta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senha" TEXT NOT NULL,
    "tipo_conta" TEXT NOT NULL,
    "saldo" DECIMAL NOT NULL DEFAULT 0,
    "data_abertura" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cartao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero_cartao" TEXT NOT NULL,
    "tipo_cartao" TEXT NOT NULL,
    "cvv" TEXT NOT NULL,
    "validade" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "dataTransacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "senha" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ClienteToConta" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ClienteToConta_A_fkey" FOREIGN KEY ("A") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ClienteToConta_B_fkey" FOREIGN KEY ("B") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AgenciaToConta" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AgenciaToConta_A_fkey" FOREIGN KEY ("A") REFERENCES "Agencia" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AgenciaToConta_B_fkey" FOREIGN KEY ("B") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AgenciaToFuncionario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AgenciaToFuncionario_A_fkey" FOREIGN KEY ("A") REFERENCES "Agencia" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AgenciaToFuncionario_B_fkey" FOREIGN KEY ("B") REFERENCES "Funcionario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContaToTransacao" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ContaToTransacao_A_fkey" FOREIGN KEY ("A") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContaToTransacao_B_fkey" FOREIGN KEY ("B") REFERENCES "Transacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CartaoToConta" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CartaoToConta_A_fkey" FOREIGN KEY ("A") REFERENCES "Cartao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CartaoToConta_B_fkey" FOREIGN KEY ("B") REFERENCES "Conta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Agencia_numero_key" ON "Agencia"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Cartao_numero_cartao_key" ON "Cartao"("numero_cartao");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_email_key" ON "Funcionario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_ClienteToConta_AB_unique" ON "_ClienteToConta"("A", "B");

-- CreateIndex
CREATE INDEX "_ClienteToConta_B_index" ON "_ClienteToConta"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgenciaToConta_AB_unique" ON "_AgenciaToConta"("A", "B");

-- CreateIndex
CREATE INDEX "_AgenciaToConta_B_index" ON "_AgenciaToConta"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgenciaToFuncionario_AB_unique" ON "_AgenciaToFuncionario"("A", "B");

-- CreateIndex
CREATE INDEX "_AgenciaToFuncionario_B_index" ON "_AgenciaToFuncionario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContaToTransacao_AB_unique" ON "_ContaToTransacao"("A", "B");

-- CreateIndex
CREATE INDEX "_ContaToTransacao_B_index" ON "_ContaToTransacao"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CartaoToConta_AB_unique" ON "_CartaoToConta"("A", "B");

-- CreateIndex
CREATE INDEX "_CartaoToConta_B_index" ON "_CartaoToConta"("B");
