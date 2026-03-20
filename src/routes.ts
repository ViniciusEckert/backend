import { Router } from "express";

import alunosController from "./controllers/alunos"
import cursosController from "./controllers/cursos"

const routes = Router();

routes.get("/", (request, response) => response.status(200).json({ success: true }));

routes.get("/alunos", (request, response) => alunosController.list(request, response));

routes.post("/alunos", (request, response) => alunosController.create(request, response));

routes.put("/aluno/:id", (request, response) => alunosController.update(request, response));

routes.get("/aluno/:id",  alunosController.getById)

routes.delete("/aluno/:id",  alunosController.deleteById)


routes.get("/curso", (request, response) => cursosController.list(request, response));

routes.post("/curso", (request, response) => cursosController.create(request, response));

routes.put("/curso/:id", (request, response) => cursosController.update(request, response));

routes.get("/curso/:id",  cursosController.getById)

routes.delete("/curso/:id",  cursosController.deleteById)

routes.put("/aluno/:id/cursos", alunosController.Conectar)

routes.put("/aluno/:id/curso", alunosController.Desconectar)
export default routes