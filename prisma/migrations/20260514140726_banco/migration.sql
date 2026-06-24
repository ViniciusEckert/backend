/*
  Warnings:

  - Added the required column `Senha` to the `Funcionario` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Funcionario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "Senha" TEXT NOT NULL
);
INSERT INTO "new_Funcionario" ("admin", "email", "id", "nome") SELECT "admin", "email", "id", "nome" FROM "Funcionario";
DROP TABLE "Funcionario";
ALTER TABLE "new_Funcionario" RENAME TO "Funcionario";
CREATE UNIQUE INDEX "Funcionario_email_key" ON "Funcionario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
