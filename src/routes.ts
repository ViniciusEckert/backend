import { Router } from "express"

import clientesController from "./controllers/clientes"
import agenciasController from "./controllers/agencias"
import contasController from "./controllers/contas"
import funcionariosController from "./controllers/funcionarios"
import cartoesController from "./controllers/cartoes"
import transacoesController from "./controllers/transacoes"

import { authentication } from "./middlewares/authentication"
import { aplicarRendimentoPoupanca } from "./services/rendimentoPoupanca"

const routes = Router()

// ======================================================
// CLIENTES
// ======================================================

routes.get("/clientes", clientesController.list)
routes.post("/clientes", clientesController.create)
routes.post("/clientes/login", clientesController.login)

routes.get("/cliente/:id", clientesController.getById)
routes.put("/clientes/:id", clientesController.update)
routes.delete("/clientes/:id", clientesController.delete)

routes.put(
  "/clientes/conectar/:id",
  clientesController.connect
)

routes.put(
  "/clientes/desconectar/:id",
  clientesController.disconnect
)

// Conectar / desconectar cliente de conta
routes.put(
  "/contas/conectarCliente/:id",
  contasController.clientConnect
)

routes.put(
  "/contas/desconectarCliente/:id",
  contasController.clientDisconnect
)


// ======================================================
// AGÊNCIAS
// ======================================================

routes.get("/agencias", agenciasController.list)
routes.post("/agencias", agenciasController.create)

routes.get("/agencia/:id", agenciasController.getById)
routes.put("/agencias/:id", agenciasController.update)
routes.delete("/agencias/:id", agenciasController.delete)

routes.put(
  "/agencias/addFuncionario/:id",
  agenciasController.conectarFunc
)

routes.put(
  "/agencias/delFuncionario/:id",
  agenciasController.desconectarFunc
)

routes.put(
  "/agencias/addConta/:id",
  agenciasController.conectarConta
)

routes.put(
  "/agencias/delConta/:id",
  agenciasController.desconectarConta
)

// Conectar / desconectar agência de conta
routes.put(
  "/contas/conectarAgencia/:id",
  contasController.agenciaConnect
)

routes.put(
  "/contas/desconectarAgencia/:id",
  contasController.agenciaDisconnect
)


// ======================================================
// CONTAS
// ======================================================

routes.get("/contas", contasController.list)
routes.post("/contas", contasController.create)

routes.get("/conta/:id", contasController.getById)
routes.put("/contas/:id", contasController.update)
routes.delete("/contas/:id", contasController.delete)

// Buscar conta pela chave Pix
routes.get(
  "/contas/pix/:chave",
  contasController.getByPix
)


// ======================================================
// FUNCIONÁRIOS
// ======================================================

routes.get("/funcionarios", funcionariosController.list)
routes.post("/funcionarios", funcionariosController.create)
routes.post("/funcionarios/login", funcionariosController.login)

routes.get("/funcionario/:id", funcionariosController.getById)
routes.put("/funcionarios/:id", funcionariosController.update)
routes.delete("/funcionarios/:id", funcionariosController.delete)


// ======================================================
// CARTÕES
// ======================================================

routes.get("/cartoes", cartoesController.list)
routes.post("/cartoes", cartoesController.create)

routes.get("/cartao/:id", cartoesController.getById)
routes.put("/cartoes/:id", cartoesController.update)
routes.delete("/cartoes/:id", cartoesController.delete)

routes.put(
  "/cartoes/conectar/:id",
  cartoesController.connect
)

routes.put(
  "/cartoes/desconectar/:id",
  cartoesController.disconnect
)

// Conectar / desconectar cartão de conta
routes.put(
  "/contas/conectarCartao/:id",
  contasController.cartaoConnect
)

routes.put(
  "/contas/desconectarCartao/:id",
  contasController.cartaoDisconnect
)


//
routes.get(
  "/transacoes",
  transacoesController.list
)

// Criar transação
routes.post(
  "/transacoes",
  transacoesController.create
)

// Buscar transação específica
routes.get(
  "/transacao/:id",
  transacoesController.getById
)

// Atualizar transação
routes.put(
  "/transacoes/:id",
  transacoesController.update
)

// Deletar transação
routes.delete(
  "/transacoes/:id",
  transacoesController.delete
)

// Conectar conta de origem
routes.put(
  "/transacoes/conectar/:id",
  transacoesController.connect
)

// Desconectar conta de origem
routes.put(
  "/transacoes/desconectar/:id",
  transacoesController.disconnect
)


routes.get(
  "/clientes/:clienteId/resumo",
  transacoesController.resumoCliente
)

// Extrato completo do cliente (todas as contas)
routes.get(
  "/clientes/:clienteId/transacoes",
  transacoesController.gestaoCliente
)

routes.get(
  "/cliente/:clienteId/analise",
  transacoesController.analiseFinanceiraCliente
)

// ======================================================
// ADMIN / RENDIMENTO
// ======================================================

routes.post(
  "/admin/rodar-rendimento",
  async (req, res) => {
    try {
      const resultado = await aplicarRendimentoPoupanca()

      res.json(resultado)
    } catch (err) {
      console.error("[rendimento] erro:", err)

      res.status(500).json({
        erro: String(err),
      })
    }
  }
)


export default routes