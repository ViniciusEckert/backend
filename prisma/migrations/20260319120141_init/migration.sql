-- CreateTable
CREATE TABLE "CursosOnAlunos" (
    "cursosId" INTEGER NOT NULL,
    "alunosid" INTEGER NOT NULL,

    PRIMARY KEY ("cursosId", "alunosid"),
    CONSTRAINT "CursosOnAlunos_cursosId_fkey" FOREIGN KEY ("cursosId") REFERENCES "Cursos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CursosOnAlunos_alunosid_fkey" FOREIGN KEY ("alunosid") REFERENCES "Alunos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
