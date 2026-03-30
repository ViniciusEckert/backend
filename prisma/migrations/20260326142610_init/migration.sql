/*
  Warnings:

  - You are about to drop the column `password` on the `Funcionarios` table. All the data in the column will be lost.
  - Added the required column `senha` to the `Funcionarios` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Funcionarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_Funcionarios" ("admin", "createdAt", "email", "id", "nome", "updateAt") SELECT "admin", "createdAt", "email", "id", "nome", "updateAt" FROM "Funcionarios";
DROP TABLE "Funcionarios";
ALTER TABLE "new_Funcionarios" RENAME TO "Funcionarios";
CREATE UNIQUE INDEX "Funcionarios_email_key" ON "Funcionarios"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
