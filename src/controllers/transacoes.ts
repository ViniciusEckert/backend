import { Request, Response } from "express"
import { prisma } from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"

export default {
  create: async (request: Request, response: Response) => {
    try {
      const {
        tipo,
        valor,
        descricao,
        contaOrigemId,
        contaDestinoId,
      } = request.body

      const clienteId = (request as any).user?.id

      if (!tipo || valor === undefined) {
        return response.status(400).json("Dados incompletos.")
      }

      // ============================
      // TRANSFERÊNCIA
      // ============================

      if (tipo === "TRANSFERENCIA") {
        if (!contaOrigemId || !contaDestinoId) {
          return response.status(400).json({
            error: "Contas de origem e destino são obrigatórias",
          })
        }

        if (Number(valor) <= 0) {
          return response.status(400).json({
            error: "Valor deve ser maior que zero",
          })
        }

        const contaOrigem = await prisma.conta.findUnique({
          where: {
            id: Number(contaOrigemId),
          },
          include: {
            clientes: true,
          },
        })

        const contaDestino = await prisma.conta.findUnique({
          where: {
            id: Number(contaDestinoId),
          },
        })

        if (!contaOrigem || !contaDestino) {
          return response.status(404).json({
            error: "Conta não encontrada",
          })
        }

        // Verifica se o cliente é dono da conta de origem
        if (clienteId) {
          const ehDono = contaOrigem.clientes.some(
            (cliente) => Number(cliente.id) === Number(clienteId)
          )

          if (!ehDono) {
            return response.status(403).json({
              error: "Acesso negado",
            })
          }
        }

        // Verifica saldo
        if (Number(contaOrigem.saldo) < Number(valor)) {
          return response.status(400).json({
            error: "Saldo insuficiente",
          })
        }

        const resultado = await prisma.$transaction(async (tx) => {
          // Debita origem
          const debito = await tx.conta.update({
            where: {
              id: Number(contaOrigemId),
            },
            data: {
              saldo: {
                decrement: Number(valor),
              },
            },
          })

          // Credita destino
          const credito = await tx.conta.update({
            where: {
              id: Number(contaDestinoId),
            },
            data: {
              saldo: {
                increment: Number(valor),
              },
            },
          })

          // Registra a transferência
          const transacao = await tx.transacao.create({
            data: {
              tipo: "TRANSFERENCIA",
              valor: Number(valor),
              descricao: descricao || "Transferência realizada",
              dataTransacao: new Date(),

              contaOrigem: {
                connect: {
                  id: Number(contaOrigemId),
                },
              },

              contaDestino: {
                connect: {
                  id: Number(contaDestinoId),
                },
              },
            },

            include: {
              contaOrigem: true,
              contaDestino: true,
            },
          })

          return {
            sucesso: true,
            mensagem: "Transferência realizada com sucesso",
            dados: {
              debito,
              credito,
              transacao,
            },
          }
        })

        return response.status(201).json(resultado)
      }

      // ============================
      // OUTRAS TRANSAÇÕES
      // ============================

      const data: {
        tipo: typeof tipo
        valor: number
        descricao?: string
        dataTransacao: Date
        contaOrigem?: {
          connect: {
            id: number
          }
        }
        contaDestino?: {
          connect: {
            id: number
          }
        }
      } = {
        tipo,
        valor: Number(valor),
        descricao: descricao || "",
        dataTransacao: new Date(),
      }

      /*
       * Para depósito:
       * contaDestinoId = conta que recebe
       *
       * Para saque/pagamento:
       * contaOrigemId = conta que perde o dinheiro
       */

      if (tipo === "DEPOSITO" && contaDestinoId) {
        data.contaDestino = {
          connect: {
            id: Number(contaDestinoId),
          },
        }
      }

      if (
        (tipo === "SAQUE" || tipo === "PAGAMENTO") &&
        contaOrigemId
      ) {
        data.contaOrigem = {
          connect: {
            id: Number(contaOrigemId),
          },
        }
      }

      const transacao = await prisma.transacao.create({
        data,

        include: {
          contaOrigem: true,
          contaDestino: true,
        },
      })

      return response.status(201).json(transacao)
    } catch (e) {
      console.error("[transacoes.create] erro real:", e)
      return handleErrors(e, response)
    }
  },

  // ============================
  // LISTAR TRANSAÇÕES
  // ============================

  list: async (request: Request, response: Response) => {
    try {
      const { contaId, tipo } = request.query

      const where: {
        tipo?: any
        OR?: {
          contaOrigemId?: number
          contaDestinoId?: number
        }[]
      } = {}

      if (tipo) {
        where.tipo = tipo
      }

      if (contaId) {
        const id = Number(contaId)

        where.OR = [
          {
            contaOrigemId: id,
          },
          {
            contaDestinoId: id,
          },
        ]
      }

      const transacoes = await prisma.transacao.findMany({
        where,

        include: {
          contaOrigem: true,
          contaDestino: true,
        },

        orderBy: {
          dataTransacao: "desc",
        },
      })

      return response.status(200).json(transacoes)
    } catch (e) {
      return handleErrors(e, response)
    }
  },

  // ============================
  // BUSCAR POR ID
  // ============================

  getById: async (request: Request, response: Response) => {
    try {
      const { id } = request.params

      const transacao = await prisma.transacao.findUnique({
        where: {
          id: Number(id),
        },

        include: {
          contaOrigem: true,
          contaDestino: true,
        },
      })

      if (!transacao) {
        return response.status(404).json({
          erro: "Transação não encontrada",
        })
      }

      return response.status(200).json(transacao)
    } catch (e) {
      return handleErrors(e, response)
    }
  },

  // ============================
  // ATUALIZAR
  // ============================

  update: async (request: Request, response: Response) => {
    try {
      const { id } = request.params
      const {
        tipo,
        valor,
        descricao,
        contaOrigemId,
        contaDestinoId,
      } = request.body

      const data: any = {}

      if (tipo) {
        data.tipo = tipo
      }

      if (valor !== undefined) {
        data.valor = Number(valor)
      }

      if (descricao !== undefined) {
        data.descricao = descricao
      }

      if (contaOrigemId !== undefined) {
        data.contaOrigem = {
          connect: {
            id: Number(contaOrigemId),
          },
        }
      }

      if (contaDestinoId !== undefined) {
        data.contaDestino = {
          connect: {
            id: Number(contaDestinoId),
          },
        }
      }

      const transacao = await prisma.transacao.update({
        data,

        where: {
          id: Number(id),
        },

        include: {
          contaOrigem: true,
          contaDestino: true,
        },
      })

      return response.status(200).json(transacao)
    } catch (e) {
      return handleErrors(e, response)
    }
  },

  // ============================
  // DELETAR
  // ============================

  delete: async (request: Request, response: Response) => {
    try {
      const { id } = request.params

      const transacao = await prisma.transacao.delete({
        where: {
          id: Number(id),
        },
      })

      return response.status(200).json(transacao)
    } catch (e) {
      return handleErrors(e, response)
    }
  },

  // ============================
  // CONECTAR CONTA DE ORIGEM
  // ============================

  connect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params
      const { contaId } = request.body

      const transacao = await prisma.transacao.update({
        where: {
          id: Number(id),
        },

        data: {
          contaOrigem: {
            connect: {
              id: Number(contaId),
            },
          },
        },

        include: {
          contaOrigem: true,
          contaDestino: true,
        },
      })

      return response.status(200).json(transacao)
    } catch (e) {
      return handleErrors(e, response)
    }
  },

  // ============================
  // DESCONECTAR CONTA DE ORIGEM
  // ============================

  disconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params

      const transacao = await prisma.transacao.update({
        where: {
          id: Number(id),
        },

        data: {
          contaOrigem: {
            disconnect: true,
          },
        },

        include: {
          contaOrigem: true,
          contaDestino: true,
        },
      })

      return response.status(200).json(transacao)
    } catch (e) {
      return handleErrors(e, response)
    }
  },
}