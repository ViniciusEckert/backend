/*
  Warnings:

  - You are about to drop the `CursosOnAlunos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CursosOnAlunos";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_AlunosToCursos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AlunosToCursos_A_fkey" FOREIGN KEY ("A") REFERENCES "Alunos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AlunosToCursos_B_fkey" FOREIGN KEY ("B") REFERENCES "Cursos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_AlunosToCursos_AB_unique" ON "_AlunosToCursos"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunosToCursos_B_index" ON "_AlunosToCursos"("B");
