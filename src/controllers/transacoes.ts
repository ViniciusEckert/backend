import { Request, Response } from "express"
import { prisma } from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"

export default {
  create: async (request: Request, response: Response) => {
    try {
      const { tipo, valor, descricao, contaOrigemId, contaDestinoId, contaIds } =
        request.body
      const clienteId = (request as any).user?.id

      // Validações básicas
      if (!tipo || !valor) {
        return response.status(400).json("Dados incompletos.")
      }

      // Se for TRANSFERENCIA, precisa validar contas e fazer transação Prisma
      if (tipo === "TRANSFERENCIA") {
        if (!contaOrigemId || !contaDestinoId) {
          return response
            .status(400)
            .json({ error: "Contas de origem e destino são obrigatórias" })
        }

        if (valor <= 0) {
          return response
            .status(400)
            .json({ error: "Valor deve ser maior que zero" })
        }

        // Buscar contas
        const contaOrigem = await prisma.conta.findUnique({
          where: { id: +contaOrigemId },
          include: { clientes: true },
        })

        const contaDestino = await prisma.conta.findUnique({
          where: { id: +contaDestinoId },
        })

        if (!contaOrigem || !contaDestino) {
          return response
            .status(404)
            .json({ error: "Conta não encontrada" })
        }

        // Verificar se cliente é dono da conta origem
        const ehDono = contaOrigem.clientes?.some(
          (c: any) => c.id === clienteId
        )
        if (!ehDono) {
          return response.status(403).json({ error: "Acesso negado" })
        }

        // Verificar saldo
        if (contaOrigem.saldo < valor) {
          return response
            .status(400)
            .json({ error: "Saldo insuficiente" })
        }

        // Usar transação do Prisma para garantir atomicidade
        const resultado = await prisma.$transaction(async (tx) => {
          // Debitar da conta origem
          const debito = await tx.conta.update({
            where: { id: +contaOrigemId },
            data: { saldo: { decrement: valor } },
          })

          // Creditar na conta destino
          const credito = await tx.conta.update({
            where: { id: +contaDestinoId },
            data: { saldo: { increment: valor } },
          })

          // Criar transação de saída (origem)
          const transacaoSaida = await tx.transacao.create({
            data: {
              tipo: "TRANSFERENCIA",
              valor: -valor,
              descricao: descricao || "Transferência enviada",
              dataTransacao: new Date(),
              conta: { connect: { id: +contaOrigemId } },
            },
          })

          // Criar transação de entrada (destino)
          const transacaoEntrada = await tx.transacao.create({
            data: {
              tipo: "TRANSFERENCIA",
              valor: valor,
              descricao: descricao || "Transferência recebida",
              dataTransacao: new Date(),
              conta: { connect: { id: +contaDestinoId } },
            },
          })

          return {
            sucesso: true,
            mensagem: "Transferência realizada com sucesso",
            dados: {
              debito,
              credito,
              transacaoSaida,
              transacaoEntrada,
            },
          }
        })

        return response.status(201).json(resultado)
      }

      // Para outros tipos de transação, usar o fluxo padrão
      const data: any = {
        tipo,
        valor,
        descricao: descricao || "",
        dataTransacao: new Date(),
      }

      if (contaIds) {
        data.conta = { connect: contaIds.map((id: number) => ({ id })) }
      }

      const transacao = await prisma.transacao.create({
        data,
      })

      return response.status(201).json(transacao)
    } catch (e) {
      return handleErrors(e, response)
    }
  },

  list: async (request: Request, response: Response) => {
    try {
      const { contaId, tipo } = request.query

      const where: any = {}
      if (contaId) where.contaId = +contaId
      if (tipo) where.tipo = tipo

      const transacoes = await prisma.transacao.findMany({
        where,
        include: { conta: true },
        orderBy: { dataTransacao: "desc" },
      })
      return response.status(200).json(transacoes)
    } catch (e) {
      handleErrors(e, response)
    }
  },

  getById: async (request: Request, response: Response) => {
    try {
      const { id } = request.params
      const transacao = await prisma.transacao.findUnique({
        where: { id: +id },
        include: { conta: true },
      })
      return response.status(200).json(transacao)
    } catch (e) {
      handleErrors(e, response)
    }
  },

  update: async (request: Request, response: Response) => {
    try {
      const { id } = request.params
      const { tipo, valor, descricao } = request.body

      const data: any = {}
      if (tipo) data.tipo = tipo
      if (valor) data.valor = valor
      if (descricao) data.descricao = descricao

      const transacao = await prisma.transacao.update({
        data,
        where: { id: +id },
      })
      return response.status(200).json(transacao)
    } catch (e) {
      handleErrors(e, response)
    }
  },

  delete: async (request: Request, response: Response) => {
    try {
      const { id } = request.params
      const transacao = await prisma.transacao.delete({
        where: { id: +id },
      })
      return response.status(200).json(transacao)
    } catch (e) {
      handleErrors(e, response)
    }
  },

  connect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params
      const { contaId } = request.body

      const transacao = await prisma.transacao.update({
        where: { id: +id },
        data: {
          conta: {
            connect: contaId.map((id: number) => ({ id })),
          },
        },
      })
      return response.status(200).json(transacao)
    } catch (e) {
      handleErrors(e, response)
    }
  },

  disconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params
      const { contaId } = request.body

      const transacao = await prisma.transacao.update({
        where: { id: +id },
        data: {
          conta: {
            disconnect: contaId.map((id: number) => ({ id })),
          },
        },
      })
      return response.status(200).json(transacao)
    } catch (e) {
      handleErrors(e, response)
    }
  },
}