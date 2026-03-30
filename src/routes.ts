import { Router } from "express";
import { authentication } from "./middlewares/authentication";

import alunosController from "./controllers/alunos"
import cursosController from "./controllers/cursos"
import funcionariosController from "./controllers/funcionarios";

const routes = Router();

routes.get("/", (request, response) => response.status(200).json({ success: true }));

routes.get("/alunos",  authentication, alunosController.list);

routes.post("/alunos", authentication,alunosController.create);

routes.put("/aluno/:id", authentication,alunosController.update);

routes.get("/aluno/:id",  authentication,alunosController.getById)

routes.delete("/aluno/:id",  authentication,alunosController.deleteById)


routes.get("/curso", authentication,cursosController.list);

routes.post("/curso", authentication,cursosController.create);

routes.put("/curso/:id", authentication,cursosController.update);

routes.get("/curso/:id",  authentication,cursosController.getById)

routes.delete("/curso/:id",  authentication,cursosController.deleteById)

routes.put("/aluno/:id/cursos", authentication,alunosController.Conectar)

routes.put("/aluno/:id/curso", authentication,alunosController.Desconectar)


routes.get("/funcionarios", authentication,funcionariosController.list);

routes.post("/funcionarios", authentication,funcionariosController.create);

routes.put("/funcionarios/:id", authentication,funcionariosController.update);

routes.get("/funcionarios/:id",  authentication,funcionariosController.getById)

routes.delete("/funcionarios/:id",  authentication,funcionariosController.delete)

routes.post("/funcionarios/login", funcionariosController.login)

export default routes