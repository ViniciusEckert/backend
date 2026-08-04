import { Router } from "express"
import clientesController from "./controllers/clientes"
import agenciasController from "./controllers/agencias"
import contasController from "./controllers/contas"
import funcionariosController from "./controllers/funcionarios"
import cartoesController from "./controllers/cartoes"
import transacoesController from "./controllers/transacoes"
import { authentication } from "./middlewares/authentication"

const routes = Router()

///////////////// CLIENTES /////////////////
routes.get("/clientes",  clientesController.list)
routes.post("/clientes", clientesController.create)
routes.post("/clientes/login", clientesController.login)
routes.get("/cliente/:id", clientesController.getById)
routes.put("/clientes/:id", clientesController.update)
routes.delete("/clientes/:id", clientesController.delete)
routes.put("/clientes/conectar/:id", clientesController.connect)
routes.put("/clientes/desconectar/:id", clientesController.disconnect)
routes.put("/contas/conectarCliente/:id", contasController.clientConnect)
routes.put("/contas/desconectarCliente/:id", contasController.clientDisconnect)

///////////////// AGÊNCIAS /////////////////
routes.get("/agencias", agenciasController.list)
routes.post("/agencias", agenciasController.create)
routes.get("/agencia/:id", agenciasController.getById)
routes.put("/agencias/:id", agenciasController.update)
routes.delete("/agencias/:id", agenciasController.delete)
routes.put("/agencias/addFuncionario/:id", agenciasController.conectarFunc)
routes.put("/agencias/delFuncionario/:id", agenciasController.desconectarFunc)
routes.put("/agencias/addConta/:id", agenciasController.conectarConta)
routes.put("/agencias/delConta/:id", agenciasController.desconectarConta)
routes.put("/contas/conectarAgencia/:id", contasController.agenciaConnect)
routes.put("/contas/desconectarAgencia/:id", contasController.agenciaDisconnect)


///////////////// CONTAS /////////////////.
routes.get("/contas", contasController.list)
routes.post("/contas", contasController.create)
routes.get("/conta/:id", contasController.getById)
routes.put("/contas/:id", contasController.update)
routes.delete("/contas/:id", contasController.delete)
routes.get("/contas/:pix", contasController.getByPix)

///////////////// FUNCIONARIOS /////////////////
routes.get("/funcionarios", funcionariosController.list)
routes.post("/funcionarios", funcionariosController.create)
routes.post("/funcionarios/login", funcionariosController.login)
routes.get("/funcionario/:id", funcionariosController.getById)
routes.put("/funcionarios/:id", funcionariosController.update)
routes.delete("/funcionarios/:id", funcionariosController.delete)

///////////////// CARTÕES /////////////////.
routes.get("/cartoes", cartoesController.list)
routes.post("/cartoes", cartoesController.create)
routes.get("/cartao/:id", cartoesController.getById)
routes.put("/cartoes/:id", cartoesController.update)
routes.delete("/cartoes/:id", cartoesController.delete)
routes.put("/cartoes/conectar/:id", cartoesController.connect)
routes.put("/cartoes/desconectar/:id", cartoesController.disconnect)
routes.put("/contas/conectarCartao/:id", contasController.cartaoConnect)
routes.put("/contas/desconectarCartao/:id", contasController.cartaoDisconnect)

///////////////// TRANSAÇÕES /////////////////.
routes.get("/transacoes", transacoesController.list)
routes.post("/transacoes", transacoesController.create)
routes.get("/transacao/:id", transacoesController.getById)
routes.put("/transacoes/:id", transacoesController.update)
routes.delete("/transacoes/:id", transacoesController.delete)
routes.put("/transacoes/conectar/:id", transacoesController.connect)
routes.put("/transacoes/desconectar/:id", transacoesController.disconnect)
routes.put("/contas/conectarTransacao/:id", contasController.transConnect)
routes.put("/contas/desconectarTransacao/:id", contasController.transDisconnect)

export default routes