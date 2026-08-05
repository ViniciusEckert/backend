import swaggerJsdoc from "swagger-jsdoc"
import { prismaSchemas } from "./prismaSchemas"

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "🏦 BancoApp API",
    version: "1.0.0",
    description: `
## Sistema Bancário Estudantil — Projeto Fictício

API REST desenvolvida com **Node.js + Express + Prisma + SQLite** para simular operações de um banco digital.

### Funcionalidades
- Cadastro e autenticação de **Clientes** e **Funcionários**
- Gestão de **Agências**, **Contas**, **Cartões** e **Transações**
- Vínculos entre entidades (conta ↔ cliente, agência ↔ funcionário, etc.)
- Consulta de conta por **chave Pix**

> ⚠️ Este projeto é **exclusivamente educacional** e não representa um sistema bancário real.
    `,
    contact: {
      name: "Projeto Estudantil",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor de Desenvolvimento",
    },
  ],
  tags: [
    { name: "Clientes", description: "Operações relacionadas aos clientes do banco" },
    { name: "Agências", description: "Gestão das agências bancárias" },
    { name: "Contas", description: "Operações sobre contas bancárias" },
    { name: "Funcionários", description: "Gestão dos funcionários do banco" },
    { name: "Cartões", description: "Gestão dos cartões vinculados às contas" },
    { name: "Transações", description: "Registro e consulta de transações financeiras" },
  ],
  components: {
    schemas: prismaSchemas,
  },
  paths: {
    // ═══════════════════════════════════════════════════════════════
    //  CLIENTES
    // ═══════════════════════════════════════════════════════════════

    "/clientes": {
      get: {
        tags: ["Clientes"],
        summary: "Listar todos os clientes",
        description: "Retorna a lista de todos os clientes cadastrados no sistema.",
        responses: {
          200: {
            description: "Lista de clientes retornada com sucesso",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Cliente" } },
              },
            },
          },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      post: {
        tags: ["Clientes"],
        summary: "Criar novo cliente",
        description: "Cadastra um novo cliente no sistema. CPF e e-mail devem ser únicos.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ClienteCreate" } } },
        },
        responses: {
          201: { description: "Cliente criado com sucesso", content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } } },
          400: { description: "Dados inválidos ou duplicados", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/clientes/login": {
      post: {
        tags: ["Clientes"],
        summary: "Login do cliente",
        description: "Autentica um cliente com e-mail e senha.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ClienteLogin" } } },
        },
        responses: {
          200: { description: "Login realizado com sucesso", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          401: { description: "Credenciais inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/cliente/{id}": {
      get: {
        tags: ["Clientes"],
        summary: "Buscar cliente por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Cliente encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } } },
          404: { description: "Cliente não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/clientes/{id}": {
      put: {
        tags: ["Clientes"],
        summary: "Atualizar cliente",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ClienteUpdate" } } },
        },
        responses: {
          200: { description: "Cliente atualizado com sucesso", content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } } },
          404: { description: "Cliente não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      delete: {
        tags: ["Clientes"],
        summary: "Deletar cliente",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Cliente deletado com sucesso", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Cliente não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/clientes/conectar/{id}": {
      put: {
        tags: ["Clientes"],
        summary: "Vincular cliente a uma conta",
        description: "Associa o cliente (identificado pelo `id` na rota) a uma conta bancária.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID do cliente" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } },
        },
        responses: {
          200: { description: "Vinculado com sucesso", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/clientes/desconectar/{id}": {
      put: {
        tags: ["Clientes"],
        summary: "Desvincular cliente de uma conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID do cliente" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } },
        },
        responses: {
          200: { description: "Desvinculado com sucesso", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    //  AGÊNCIAS
    // ═══════════════════════════════════════════════════════════════

    "/agencias": {
      get: {
        tags: ["Agências"],
        summary: "Listar todas as agências",
        responses: {
          200: { description: "Lista de agências", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Agencia" } } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      post: {
        tags: ["Agências"],
        summary: "Criar nova agência",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AgenciaCreate" } } },
        },
        responses: {
          201: { description: "Agência criada", content: { "application/json": { schema: { $ref: "#/components/schemas/Agencia" } } } },
          400: { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/agencia/{id}": {
      get: {
        tags: ["Agências"],
        summary: "Buscar agência por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Agência encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Agencia" } } } },
          404: { description: "Agência não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/agencias/{id}": {
      put: {
        tags: ["Agências"],
        summary: "Atualizar agência",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AgenciaUpdate" } } },
        },
        responses: {
          200: { description: "Agência atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Agencia" } } } },
          404: { description: "Não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      delete: {
        tags: ["Agências"],
        summary: "Deletar agência",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Agência deletada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/agencias/addFuncionario/{id}": {
      put: {
        tags: ["Agências"],
        summary: "Adicionar funcionário à agência",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da agência" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Funcionário adicionado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/agencias/delFuncionario/{id}": {
      put: {
        tags: ["Agências"],
        summary: "Remover funcionário da agência",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da agência" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Funcionário removido", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/agencias/addConta/{id}": {
      put: {
        tags: ["Agências"],
        summary: "Adicionar conta à agência",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da agência" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Conta vinculada à agência", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/agencias/delConta/{id}": {
      put: {
        tags: ["Agências"],
        summary: "Remover conta da agência",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da agência" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Conta desvinculada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    //  CONTAS
    // ═══════════════════════════════════════════════════════════════

    "/contas": {
      get: {
        tags: ["Contas"],
        summary: "Listar todas as contas",
        responses: {
          200: { description: "Lista de contas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Conta" } } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      post: {
        tags: ["Contas"],
        summary: "Criar nova conta",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ContaCreate" } } },
        },
        responses: {
          201: { description: "Conta criada", content: { "application/json": { schema: { $ref: "#/components/schemas/Conta" } } } },
          400: { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/conta/{id}": {
      get: {
        tags: ["Contas"],
        summary: "Buscar conta por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Conta encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Conta" } } } },
          404: { description: "Conta não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Atualizar conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ContaUpdate" } } },
        },
        responses: {
          200: { description: "Conta atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Conta" } } } },
          404: { description: "Não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      delete: {
        tags: ["Contas"],
        summary: "Deletar conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Conta deletada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/pix/{chave}": {
      get: {
        tags: ["Contas"],
        summary: "Buscar conta por chave Pix",
        parameters: [{ name: "chave", in: "path", required: true, schema: { type: "string" }, example: "joao@email.com", description: "Chave Pix da conta" }],
        responses: {
          200: { description: "Conta encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Conta" } } } },
          404: { description: "Conta não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/conectarCliente/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Vincular cliente à conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da conta" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Cliente vinculado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/desconectarCliente/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Desvincular cliente da conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da conta" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Cliente desvinculado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/conectarAgencia/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Vincular agência à conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da conta" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Agência vinculada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/desconectarAgencia/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Desvincular agência da conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da conta" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Agência desvinculada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/conectarCartao/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Vincular cartão à conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da conta" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Cartão vinculado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/desconectarCartao/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Desvincular cartão da conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da conta" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Cartão desvinculado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/conectarTransacao/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Vincular transação à conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da conta" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Transação vinculada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/contas/desconectarTransacao/{id}": {
      put: {
        tags: ["Contas"],
        summary: "Desvincular transação da conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da conta" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Transação desvinculada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    //  FUNCIONÁRIOS
    // ═══════════════════════════════════════════════════════════════

    "/funcionarios": {
      get: {
        tags: ["Funcionários"],
        summary: "Listar todos os funcionários",
        responses: {
          200: { description: "Lista de funcionários", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Funcionario" } } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      post: {
        tags: ["Funcionários"],
        summary: "Criar novo funcionário",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/FuncionarioCreate" } } },
        },
        responses: {
          201: { description: "Funcionário criado", content: { "application/json": { schema: { $ref: "#/components/schemas/Funcionario" } } } },
          400: { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/funcionarios/login": {
      post: {
        tags: ["Funcionários"],
        summary: "Login do funcionário",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/FuncionarioLogin" } } },
        },
        responses: {
          200: { description: "Login realizado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          401: { description: "Credenciais inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/funcionario/{id}": {
      get: {
        tags: ["Funcionários"],
        summary: "Buscar funcionário por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Funcionário encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Funcionario" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/funcionarios/{id}": {
      put: {
        tags: ["Funcionários"],
        summary: "Atualizar funcionário",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/FuncionarioUpdate" } } },
        },
        responses: {
          200: { description: "Funcionário atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Funcionario" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      delete: {
        tags: ["Funcionários"],
        summary: "Deletar funcionário",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Funcionário deletado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    //  CARTÕES
    // ═══════════════════════════════════════════════════════════════

    "/cartoes": {
      get: {
        tags: ["Cartões"],
        summary: "Listar todos os cartões",
        responses: {
          200: { description: "Lista de cartões", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Cartao" } } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      post: {
        tags: ["Cartões"],
        summary: "Criar novo cartão",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CartaoCreate" } } },
        },
        responses: {
          201: { description: "Cartão criado", content: { "application/json": { schema: { $ref: "#/components/schemas/Cartao" } } } },
          400: { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/cartao/{id}": {
      get: {
        tags: ["Cartões"],
        summary: "Buscar cartão por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Cartão encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Cartao" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/cartoes/{id}": {
      put: {
        tags: ["Cartões"],
        summary: "Atualizar cartão",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CartaoUpdate" } } },
        },
        responses: {
          200: { description: "Cartão atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Cartao" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      delete: {
        tags: ["Cartões"],
        summary: "Deletar cartão",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Cartão deletado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/cartoes/conectar/{id}": {
      put: {
        tags: ["Cartões"],
        summary: "Vincular cartão a uma conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID do cartão" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Cartão vinculado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/cartoes/desconectar/{id}": {
      put: {
        tags: ["Cartões"],
        summary: "Desvincular cartão de uma conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID do cartão" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Cartão desvinculado", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    // ═══════════════════════════════════════════════════════════════
    //  TRANSAÇÕES
    // ═══════════════════════════════════════════════════════════════

    "/transacoes": {
      get: {
        tags: ["Transações"],
        summary: "Listar todas as transações",
        responses: {
          200: { description: "Lista de transações", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Transacao" } } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      post: {
        tags: ["Transações"],
        summary: "Criar nova transação",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TransacaoCreate" } } },
        },
        responses: {
          201: { description: "Transação criada", content: { "application/json": { schema: { $ref: "#/components/schemas/Transacao" } } } },
          400: { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/transacao/{id}": {
      get: {
        tags: ["Transações"],
        summary: "Buscar transação por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Transação encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Transacao" } } } },
          404: { description: "Não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/transacoes/{id}": {
      put: {
        tags: ["Transações"],
        summary: "Atualizar transação",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TransacaoUpdate" } } },
        },
        responses: {
          200: { description: "Transação atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/Transacao" } } } },
          404: { description: "Não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
      delete: {
        tags: ["Transações"],
        summary: "Deletar transação",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          200: { description: "Transação deletada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/transacoes/conectar/{id}": {
      put: {
        tags: ["Transações"],
        summary: "Vincular transação a uma conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da transação" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Transação vinculada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },

    "/transacoes/desconectar/{id}": {
      put: {
        tags: ["Transações"],
        summary: "Desvincular transação de uma conta",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1, description: "ID da transação" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RelacaoId" } } } },
        responses: {
          200: { description: "Transação desvinculada", content: { "application/json": { schema: { $ref: "#/components/schemas/MensagemSucesso" } } } },
          404: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroNaoEncontrado" } } } },
          500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErroGenerico" } } } },
        },
      },
    },
  },
}

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [],
}

export const swaggerSpec = swaggerJsdoc(options)
export default swaggerDefinition