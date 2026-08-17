import { Request, Response } from "express"
import { prisma } from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"
import { Prisma, TipoTransacao, CategoriaGasto } from "../../generated/prisma/client"

const criarFiltroData = (
  inicio?: string,
  fim?: string
) => {
  const filtro: {
    gte?: Date
    lte?: Date
  } = {}

  if (inicio) {
    const dataInicio = new Date(`${inicio}T00:00:00`)

    if (isNaN(dataInicio.getTime())) {
      throw new Error("Data de início inválida")
    }

    filtro.gte = dataInicio
  }

  if (fim) {
    const dataFim = new Date(`${fim}T23:59:59.999`)

    if (isNaN(dataFim.getTime())) {
      throw new Error("Data de fim inválida")
    }

    filtro.lte = dataFim
  }

  return filtro
}

export default {
  // =========================================================
  // CRIAR TRANSAÇÃO
  // =========================================================

  create: async (request: Request, response: Response) => {
    try {
      const {
        tipo,
        categoria,
        valor,
        descricao,
        contaOrigemId,
        contaDestinoId,
      } = request.body

      const clienteId = (request as { user?: { id?: number } }).user?.id

      // ---------------------------------------------------------
      // VALIDAÇÕES BÁSICAS
      // ---------------------------------------------------------

      if (!tipo || valor === undefined) {
        return response.status(400).json({
          error: "Tipo e valor são obrigatórios.",
        })
      }

      const valorNumerico = Number(valor)

      if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
        return response.status(400).json({
          error: "O valor deve ser um número maior que zero.",
        })
      }

      // ---------------------------------------------------------
      // VALIDA TIPO
      // ---------------------------------------------------------

      const tiposValidos = Object.values(TipoTransacao)

      if (!tiposValidos.includes(tipo as TipoTransacao)) {
        return response.status(400).json({
          error: "Tipo de transação inválido.",
          tiposValidos,
        })
      }

      // ---------------------------------------------------------
      // VALIDA CATEGORIA
      // ---------------------------------------------------------

      let categoriaValida: CategoriaGasto | null = null

      if (categoria !== undefined && categoria !== null && categoria !== "") {
        const categoriasValidas = Object.values(CategoriaGasto)

        if (!categoriasValidas.includes(categoria as CategoriaGasto)) {
          return response.status(400).json({
            error: "Categoria de gasto inválida.",
            categoriasValidas,
          })
        }

        categoriaValida = categoria as CategoriaGasto
      }

      // =========================================================
      // TRANSFERÊNCIA
      // =========================================================

      if (tipo === "TRANSFERENCIA") {
        if (!contaOrigemId || !contaDestinoId) {
          return response.status(400).json({
            error: "Conta de origem e conta de destino são obrigatórias.",
          })
        }

        const origemId = Number(contaOrigemId)
        const destinoId = Number(contaDestinoId)

        if (!Number.isInteger(origemId) || !Number.isInteger(destinoId)) {
          return response.status(400).json({
            error: "IDs das contas inválidos.",
          })
        }

        if (origemId === destinoId) {
          return response.status(400).json({
            error: "A conta de origem e destino não podem ser iguais.",
          })
        }

        // ---------------------------------------------------------
        // BUSCA CONTA DE ORIGEM
        // ---------------------------------------------------------

        const contaOrigem = await prisma.conta.findUnique({
          where: {
            id: origemId,
          },
          include: {
            clientes: true,
          },
        })

        // ---------------------------------------------------------
        // BUSCA CONTA DE DESTINO
        // ---------------------------------------------------------

        const contaDestino = await prisma.conta.findUnique({
          where: {
            id: destinoId,
          },
        })

        if (!contaOrigem || !contaDestino) {
          return response.status(404).json({
            error: "Conta de origem ou destino não encontrada.",
          })
        }

        // ---------------------------------------------------------
        // VERIFICA DONO DA CONTA
        // ---------------------------------------------------------

        if (clienteId !== undefined) {
          const ehDono = contaOrigem.clientes.some(
            (cliente) => Number(cliente.id) === Number(clienteId)
          )

          if (!ehDono) {
            return response.status(403).json({
              error: "Você não possui permissão para utilizar esta conta.",
            })
          }
        }

        // ---------------------------------------------------------
        // VERIFICA SALDO
        // ---------------------------------------------------------

        if (Number(contaOrigem.saldo) < valorNumerico) {
          return response.status(400).json({
            error: "Saldo insuficiente.",
          })
        }

        // ---------------------------------------------------------
        // EXECUTA TRANSFERÊNCIA
        // ---------------------------------------------------------

        const resultado = await prisma.$transaction(async (tx) => {
          const debito = await tx.conta.update({
            where: {
              id: origemId,
            },
            data: {
              saldo: {
                decrement: valorNumerico,
              },
            },
          })

          const credito = await tx.conta.update({
            where: {
              id: destinoId,
            },
            data: {
              saldo: {
                increment: valorNumerico,
              },
            },
          })

          const transacao = await tx.transacao.create({
            data: {
              tipo: TipoTransacao.TRANSFERENCIA,
              categoria: categoriaValida,
              valor: valorNumerico,
              descricao:
                descricao || "Transferência realizada",
              dataTransacao: new Date(),

              contaOrigem: {
                connect: {
                  id: origemId,
                },
              },

              contaDestino: {
                connect: {
                  id: destinoId,
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
            mensagem: "Transferência realizada com sucesso.",
            dados: {
              debito,
              credito,
              transacao,
            },
          }
        })

        return response.status(201).json(resultado)
      }

      // =========================================================
      // OUTRAS TRANSAÇÕES
      // =========================================================

      const data: Prisma.TransacaoCreateInput = {
        tipo: tipo as TipoTransacao,
        categoria: categoriaValida,
        valor: valorNumerico,
        descricao: descricao || "",
        dataTransacao: new Date(),
      }

// ---------------------------------------------------------
// DEPÓSITO
// ---------------------------------------------------------

if (tipo === "DEPOSITO") {
  if (!contaDestinoId) {
    return response.status(400).json({
      error: "A conta de destino é obrigatória para depósitos.",
    })
  }

  const destinoId = Number(contaDestinoId)

  if (!Number.isInteger(destinoId)) {
    return response.status(400).json({
      error: "ID da conta de destino inválido.",
    })
  }

  const contaDestino = await prisma.conta.findUnique({
    where: {
      id: destinoId,
    },
  })

  if (!contaDestino) {
    return response.status(404).json({
      error: "Conta de destino não encontrada.",
    })
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const credito = await tx.conta.update({
      where: {
        id: destinoId,
      },
      data: {
        saldo: {
          increment: valorNumerico,
        },
      },
    })

    const transacao = await tx.transacao.create({
      data: {
        ...data,

        contaDestino: {
          connect: {
            id: destinoId,
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
      mensagem: "Depósito realizado com sucesso.",
      dados: {
        credito,
        transacao,
      },
    }
  })

  return response.status(201).json(resultado)
}

// ---------------------------------------------------------
// SAQUE
// ---------------------------------------------------------

if (tipo === "SAQUE") {
  if (!contaOrigemId) {
    return response.status(400).json({
      error: "A conta de origem é obrigatória para saques.",
    })
  }

  const origemId = Number(contaOrigemId)

  if (!Number.isInteger(origemId)) {
    return response.status(400).json({
      error: "ID da conta de origem inválido.",
    })
  }

  const contaOrigem = await prisma.conta.findUnique({
    where: {
      id: origemId,
    },
    include: {
      clientes: true,
    },
  })

  if (!contaOrigem) {
    return response.status(404).json({
      error: "Conta de origem não encontrada.",
    })
  }

  if (clienteId !== undefined) {
    const ehDono = contaOrigem.clientes.some(
      (cliente) => Number(cliente.id) === Number(clienteId)
    )

    if (!ehDono) {
      return response.status(403).json({
        error: "Você não possui permissão para utilizar esta conta.",
      })
    }
  }

  if (Number(contaOrigem.saldo) < valorNumerico) {
    return response.status(400).json({
      error: "Saldo insuficiente.",
    })
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const debito = await tx.conta.update({
      where: {
        id: origemId,
      },
      data: {
        saldo: {
          decrement: valorNumerico,
        },
      },
    })

    const transacao = await tx.transacao.create({
      data: {
        ...data,

        contaOrigem: {
          connect: {
            id: origemId,
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
      mensagem: "Saque realizado com sucesso.",
      dados: {
        debito,
        transacao,
      },
    }
  })

  return response.status(201).json(resultado)
}

// ---------------------------------------------------------
// PAGAMENTO
// ---------------------------------------------------------

if (tipo === "PAGAMENTO") {
  if (!contaOrigemId) {
    return response.status(400).json({
      error: "A conta de origem é obrigatória para pagamentos.",
    })
  }

  const origemId = Number(contaOrigemId)

  if (!Number.isInteger(origemId)) {
    return response.status(400).json({
      error: "ID da conta de origem inválido.",
    })
  }

  const contaOrigem = await prisma.conta.findUnique({
    where: {
      id: origemId,
    },
    include: {
      clientes: true,
    },
  })

  if (!contaOrigem) {
    return response.status(404).json({
      error: "Conta de origem não encontrada.",
    })
  }

  if (clienteId !== undefined) {
    const ehDono = contaOrigem.clientes.some(
      (cliente) => Number(cliente.id) === Number(clienteId)
    )

    if (!ehDono) {
      return response.status(403).json({
        error: "Você não possui permissão para utilizar esta conta.",
      })
    }
  }

  if (Number(contaOrigem.saldo) < valorNumerico) {
    return response.status(400).json({
      error: "Saldo insuficiente.",
    })
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const debito = await tx.conta.update({
      where: {
        id: origemId,
      },
      data: {
        saldo: {
          decrement: valorNumerico,
        },
      },
    })

    const transacao = await tx.transacao.create({
      data: {
        ...data,

        contaOrigem: {
          connect: {
            id: origemId,
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
      mensagem: "Pagamento realizado com sucesso.",
      dados: {
        debito,
        transacao,
      },
    }
  })

  return response.status(201).json(resultado)
}

// ---------------------------------------------------------
// RENDIMENTO
// ---------------------------------------------------------

if (tipo === "RENDIMENTO") {
  if (!contaDestinoId && !contaOrigemId) {
    return response.status(400).json({
      error: "Uma conta deve ser informada para o rendimento.",
    })
  }

  const contaId = Number(
    contaDestinoId ?? contaOrigemId
  )

  if (!Number.isInteger(contaId)) {
    return response.status(400).json({
      error: "ID da conta inválido.",
    })
  }

  const conta = await prisma.conta.findUnique({
    where: {
      id: contaId,
    },
  })

  if (!conta) {
    return response.status(404).json({
      error: "Conta não encontrada.",
    })
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const credito = await tx.conta.update({
      where: {
        id: contaId,
      },
      data: {
        saldo: {
          increment: valorNumerico,
        },
      },
    })

    const transacao = await tx.transacao.create({
      data: {
        ...data,

        contaDestino: {
          connect: {
            id: contaId,
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
      mensagem: "Rendimento aplicado com sucesso.",
      dados: {
        credito,
        transacao,
      },
    }
  })

  return response.status(201).json(resultado)
}
      // ---------------------------------------------------------
      // CRIA TRANSAÇÃO
      // ---------------------------------------------------------

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

  // =========================================================
  // LISTAR TRANSAÇÕES
  // =========================================================

  list: async (request: Request, response: Response) => {
    try {
      const {
        contaId,
        tipo,
        categoria,
      } = request.query

      const where: Prisma.TransacaoWhereInput = {}

      // ---------------------------------------------------------
      // FILTRO POR TIPO
      // ---------------------------------------------------------

      if (tipo) {
        where.tipo = tipo as TipoTransacao
      }

      // ---------------------------------------------------------
      // FILTRO POR CATEGORIA
      // ---------------------------------------------------------

      if (categoria) {
        where.categoria = categoria as CategoriaGasto
      }

      // ---------------------------------------------------------
      // FILTRO POR CONTA
      // ---------------------------------------------------------

      if (contaId) {
        const id = Number(contaId)

        if (!Number.isInteger(id)) {
          return response.status(400).json({
            error: "ID da conta inválido.",
          })
        }

        where.OR = [
          {
            contaOrigemId: id,
          },
          {
            contaDestinoId: id,
          },
        ]
      }

      // ---------------------------------------------------------
      // BUSCA
      // ---------------------------------------------------------

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
      console.error("[transacoes.list] erro:", e)

      return handleErrors(e, response)
    }
  },

  // =========================================================
  // BUSCAR TRANSAÇÃO POR ID
  // =========================================================

  getById: async (request: Request, response: Response) => {
    try {
      const { id } = request.params

      const idNumerico = Number(id)

      if (!Number.isInteger(idNumerico)) {
        return response.status(400).json({
          error: "ID da transação inválido.",
        })
      }

      const transacao = await prisma.transacao.findUnique({
        where: {
          id: idNumerico,
        },

        include: {
          contaOrigem: true,
          contaDestino: true,
        },
      })

      if (!transacao) {
        return response.status(404).json({
          error: "Transação não encontrada.",
        })
      }

      return response.status(200).json(transacao)
    } catch (e) {
      console.error("[transacoes.getById] erro:", e)

      return handleErrors(e, response)
    }
  },

  // =========================================================
  // ATUALIZAR TRANSAÇÃO
  // =========================================================

  update: async (request: Request, response: Response) => {
    try {
      const { id } = request.params

      const {
        tipo,
        categoria,
        valor,
        descricao,
        contaOrigemId,
        contaDestinoId,
      } = request.body

      const idNumerico = Number(id)

      if (!Number.isInteger(idNumerico)) {
        return response.status(400).json({
          error: "ID da transação inválido.",
        })
      }

      // ---------------------------------------------------------
      // VERIFICA SE EXISTE
      // ---------------------------------------------------------

      const transacaoExistente =
        await prisma.transacao.findUnique({
          where: {
            id: idNumerico,
          },
        })

      if (!transacaoExistente) {
        return response.status(404).json({
          error: "Transação não encontrada.",
        })
      }

      // ---------------------------------------------------------
      // MONTA DATA
      // ---------------------------------------------------------

      const data: Prisma.TransacaoUpdateInput = {}

      // ---------------------------------------------------------
      // TIPO
      // ---------------------------------------------------------

      if (tipo !== undefined) {
        const tiposValidos = Object.values(TipoTransacao)

        if (!tiposValidos.includes(tipo as TipoTransacao)) {
          return response.status(400).json({
            error: "Tipo de transação inválido.",
            tiposValidos,
          })
        }

        data.tipo = tipo as TipoTransacao
      }

      // ---------------------------------------------------------
      // CATEGORIA
      // ---------------------------------------------------------

      if (categoria !== undefined) {
        if (categoria === null || categoria === "") {
          data.categoria = null
        } else {
          const categoriasValidas =
            Object.values(CategoriaGasto)

          if (
            !categoriasValidas.includes(
              categoria as CategoriaGasto
            )
          ) {
            return response.status(400).json({
              error: "Categoria de gasto inválida.",
              categoriasValidas,
            })
          }

          data.categoria = categoria as CategoriaGasto
        }
      }

      // ---------------------------------------------------------
      // VALOR
      // ---------------------------------------------------------

      if (valor !== undefined) {
        const valorNumerico = Number(valor)

        if (
          !Number.isFinite(valorNumerico) ||
          valorNumerico <= 0
        ) {
          return response.status(400).json({
            error: "O valor deve ser maior que zero.",
          })
        }

        data.valor = valorNumerico
      }

      // ---------------------------------------------------------
      // DESCRIÇÃO
      // ---------------------------------------------------------

      if (descricao !== undefined) {
        data.descricao = descricao
      }

      // ---------------------------------------------------------
      // CONTA DE ORIGEM
      // ---------------------------------------------------------

      if (contaOrigemId !== undefined) {
        if (
          contaOrigemId === null ||
          contaOrigemId === ""
        ) {
          data.contaOrigem = {
            disconnect: true,
          }
        } else {
          const origemId = Number(contaOrigemId)

          if (!Number.isInteger(origemId)) {
            return response.status(400).json({
              error: "ID da conta de origem inválido.",
            })
          }

          data.contaOrigem = {
            connect: {
              id: origemId,
            },
          }
        }
      }

      // ---------------------------------------------------------
      // CONTA DE DESTINO
      // ---------------------------------------------------------

      if (contaDestinoId !== undefined) {
        if (
          contaDestinoId === null ||
          contaDestinoId === ""
        ) {
          data.contaDestino = {
            disconnect: true,
          }
        } else {
          const destinoId = Number(contaDestinoId)

          if (!Number.isInteger(destinoId)) {
            return response.status(400).json({
              error: "ID da conta de destino inválido.",
            })
          }

          data.contaDestino = {
            connect: {
              id: destinoId,
            },
          }
        }
      }

      // ---------------------------------------------------------
      // ATUALIZA
      // ---------------------------------------------------------

      const transacao = await prisma.transacao.update({
        where: {
          id: idNumerico,
        },

        data,

        include: {
          contaOrigem: true,
          contaDestino: true,
        },
      })

      return response.status(200).json(transacao)
    } catch (e) {
      console.error("[transacoes.update] erro:", e)

      return handleErrors(e, response)
    }
  },

  // =========================================================
  // DELETAR TRANSAÇÃO
  // =========================================================

  delete: async (request: Request, response: Response) => {
    try {
      const { id } = request.params

      const idNumerico = Number(id)

      if (!Number.isInteger(idNumerico)) {
        return response.status(400).json({
          error: "ID da transação inválido.",
        })
      }

      const transacao = await prisma.transacao.delete({
        where: {
          id: idNumerico,
        },
      })

      return response.status(200).json(transacao)
    } catch (e) {
      console.error("[transacoes.delete] erro:", e)

      return handleErrors(e, response)
    }
  },

  // =========================================================
  // CONECTAR CONTA DE ORIGEM
  // =========================================================

  connect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params
      const { contaId } = request.body

      const idNumerico = Number(id)
      const contaNumerica = Number(contaId)

      if (!Number.isInteger(idNumerico)) {
        return response.status(400).json({
          error: "ID da transação inválido.",
        })
      }

      if (!Number.isInteger(contaNumerica)) {
        return response.status(400).json({
          error: "ID da conta inválido.",
        })
      }

      const conta = await prisma.conta.findUnique({
        where: {
          id: contaNumerica,
        },
      })

      if (!conta) {
        return response.status(404).json({
          error: "Conta não encontrada.",
        })
      }

      const transacao = await prisma.transacao.update({
        where: {
          id: idNumerico,
        },

        data: {
          contaOrigem: {
            connect: {
              id: contaNumerica,
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
      console.error("[transacoes.connect] erro:", e)

      return handleErrors(e, response)
    }
  },

  // =========================================================
  // DESCONECTAR CONTA DE ORIGEM
  // =========================================================

  disconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params

      const idNumerico = Number(id)

      if (!Number.isInteger(idNumerico)) {
        return response.status(400).json({
          error: "ID da transação inválido.",
        })
      }

      const transacao = await prisma.transacao.update({
        where: {
          id: idNumerico,
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
      console.error("[transacoes.disconnect] erro:", e)

      return handleErrors(e, response)
    }
  },

  gestaoCliente: async (request: Request, response: Response) => {
  try {
    const { clienteId } = request.params
    const { inicio, fim } = request.query

    const id = Number(clienteId)

    if (!id || Number.isNaN(id)) {
      return response.status(400).json({
        error: "ID do cliente inválido",
      })
    }

    const inicioData =
      typeof inicio === "string" ? inicio : undefined

    const fimData =
      typeof fim === "string" ? fim : undefined

    const filtroData = criarFiltroData(
      inicioData,
      fimData
    )

    const cliente = await prisma.cliente.findUnique({
      where: {
        id,
      },
      include: {
        contas: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!cliente) {
      return response.status(404).json({
        error: "Cliente não encontrado",
      });
    }

    const contasIds = cliente.contas.map((conta) => conta.id);

    if (contasIds.length === 0) {
      return response.status(200).json([]);
    }

    const transacoes = await prisma.transacao.findMany({
      where: {
        dataTransacao: filtroData,

        OR: [
          {
            contaOrigemId: {
              in: contasIds,
            },
          },
          {
            contaDestinoId: {
              in: contasIds,
            },
          },
        ],
      },

      include: {
        contaOrigem: true,
        contaDestino: true,
      },

      orderBy: {
        dataTransacao: "desc",
      },
    })

    return response.status(200).json(transacoes);
  } catch (e) {
    console.error("[transacoes.gestaoCliente] erro:", e);

    return handleErrors(e, response);
  }
},
resumoCliente: async (request: Request, response: Response) => {
    try {
    const { clienteId } = request.params
    const { inicio, fim } = request.query

    const id = Number(clienteId)

    if (!id || Number.isNaN(id)) {
      return response.status(400).json({
        error: "ID do cliente inválido",
      })
    }

    const inicioData =
      typeof inicio === "string" ? inicio : undefined

    const fimData =
      typeof fim === "string" ? fim : undefined

    const filtroData = criarFiltroData(
      inicioData,
      fimData
    )

    const cliente = await prisma.cliente.findUnique({
      where: {
        id,
      },
      include: {
        contas: {
          select: {
            id: true,
            saldo: true,
          },
        },
      },
    });

    if (!cliente) {
      return response.status(404).json({
        error: "Cliente não encontrado",
      });
    }

    const contasIds = cliente.contas.map((conta) => conta.id);

    if (contasIds.length === 0) {
      return response.status(200).json({
        saldoTotal: 0,
        totalEntradas: 0,
        totalSaidas: 0,
        saldoPeriodo: 0,
        gastosPorCategoria: [],
      });
    }

const transacoes = await prisma.transacao.findMany({
  where: {
    dataTransacao: filtroData,

    OR: [
      {
        contaOrigemId: {
          in: contasIds,
        },
      },
      {
        contaDestinoId: {
          in: contasIds,
        },
      },
    ],
  },

  orderBy: {
    dataTransacao: "desc",
  },
})

    const saldoTotal = cliente.contas.reduce(
      (total, conta) => total + Number(conta.saldo),
      0
    );

    let totalEntradas = 0;
    let totalSaidas = 0;

    const categorias: Record<string, number> = {};

    for (const transacao of transacoes) {
      const valor = Number(transacao.valor);

      const entrouNaConta =
        transacao.contaDestinoId !== null &&
        contasIds.includes(transacao.contaDestinoId);

      const saiuDaConta =
        transacao.contaOrigemId !== null &&
        contasIds.includes(transacao.contaOrigemId);

      if (entrouNaConta && !saiuDaConta) {
        totalEntradas += valor;
      }

      if (saiuDaConta && !entrouNaConta) {
        totalSaidas += valor;

        if (transacao.categoria) {
          const categoria = transacao.categoria;

          categorias[categoria] =
            (categorias[categoria] || 0) + valor;
        }
      }
    }

    const gastosPorCategoria = Object.entries(categorias)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
      }))
      .sort((a, b) => b.valor - a.valor);

    return response.status(200).json({
      saldoTotal,
      totalEntradas,
      totalSaidas,
      saldoPeriodo: totalEntradas - totalSaidas,
      gastosPorCategoria,
    });
  } catch (e) {
    console.error("[transacoes.resumoCliente] erro:", e);

    return handleErrors(e, response);
  }
},

  // =========================================================
  // ANÁLISE FINANCEIRA DO CLIENTE
  // =========================================================

  analiseFinanceiraCliente: async (
    request: Request,
    response: Response
  ) => {
    try {
      const { clienteId } = request.params
      const { inicio, fim } = request.query

      // ---------------------------------------------------------
      // VALIDA ID
      // ---------------------------------------------------------

      const id = Number(clienteId)

      if (!Number.isInteger(id) || id <= 0) {
        return response.status(400).json({
          error: "ID do cliente inválido.",
        })
      }

      // ---------------------------------------------------------
      // DATAS
      // ---------------------------------------------------------

      const inicioData =
        typeof inicio === "string" ? inicio : undefined

      const fimData =
        typeof fim === "string" ? fim : undefined

      const filtroData = criarFiltroData(
        inicioData,
        fimData
      )

      // ---------------------------------------------------------
      // BUSCA CLIENTE E CONTAS
      // ---------------------------------------------------------

      const cliente = await prisma.cliente.findUnique({
        where: {
          id,
        },
        include: {
          contas: {
            select: {
              id: true,
              saldo: true,
            },
          },
        },
      })

      if (!cliente) {
        return response.status(404).json({
          error: "Cliente não encontrado.",
        })
      }

      const contasIds = cliente.contas.map(
        (conta) => conta.id
      )

      // ---------------------------------------------------------
      // CLIENTE SEM CONTAS
      // ---------------------------------------------------------

      if (contasIds.length === 0) {
        return response.status(200).json({
          resumo: {
            saldoTotal: 0,
            totalEntradas: 0,
            totalSaidas: 0,
            saldoPeriodo: 0,
          },

          mensal: [],

          estatisticas: {
            mediaEntradas: 0,
            desvioPadraoEntradas: 0,
            mediaSaidas: 0,
            desvioPadraoSaidas: 0,
            mediaSaldoMensal: 0,
            desvioPadraoSaldoMensal: 0,
          },

          categorias: [],

          maiorEntrada: null,
          maiorSaida: null,
        })
      }

      // ---------------------------------------------------------
      // BUSCA TRANSAÇÕES
      // ---------------------------------------------------------

      const transacoes = await prisma.transacao.findMany({
        where: {
          dataTransacao: filtroData,

          OR: [
            {
              contaOrigemId: {
                in: contasIds,
              },
            },
            {
              contaDestinoId: {
                in: contasIds,
              },
            },
          ],
        },

        orderBy: {
          dataTransacao: "asc",
        },
      })

      // ---------------------------------------------------------
      // SALDO TOTAL ATUAL
      // ---------------------------------------------------------

      const saldoTotal = cliente.contas.reduce(
        (total, conta) =>
          total + Number(conta.saldo),
        0
      )

      // ---------------------------------------------------------
      // ESTRUTURA MENSAL
      // ---------------------------------------------------------

      type DadosMensais = {
        mes: string
        entradas: number
        saidas: number
        saldo: number
        quantidadeTransacoes: number
      }

      const meses: Record<string, DadosMensais> = {}

      // ---------------------------------------------------------
      // CATEGORIAS
      // ---------------------------------------------------------

      const categorias: Record<string, number> = {}

      // ---------------------------------------------------------
      // TOTAIS
      // ---------------------------------------------------------

      let totalEntradas = 0
      let totalSaidas = 0

      // ---------------------------------------------------------
      // PROCESSA TRANSAÇÕES
      // ---------------------------------------------------------

      for (const transacao of transacoes) {
        const valor = Number(transacao.valor)

        if (!Number.isFinite(valor)) {
          continue
        }

        const data = new Date(
          transacao.dataTransacao
        )

        // ---------------------------------------------
        // IDENTIFICA O MÊS
        // ---------------------------------------------

        const ano = data.getFullYear()
        const mesNumero = String(
          data.getMonth() + 1
        ).padStart(2, "0")

        const mes = `${ano}-${mesNumero}`

        // ---------------------------------------------
        // CRIA MÊS SE NÃO EXISTIR
        // ---------------------------------------------

        if (!meses[mes]) {
          meses[mes] = {
            mes,
            entradas: 0,
            saidas: 0,
            saldo: 0,
            quantidadeTransacoes: 0,
          }
        }

        meses[mes].quantidadeTransacoes++

        // ---------------------------------------------
        // VERIFICA ORIGEM E DESTINO
        // ---------------------------------------------

        const saiuDaConta =
          transacao.contaOrigemId !== null &&
          contasIds.includes(
            transacao.contaOrigemId
          )

        const entrouNaConta =
          transacao.contaDestinoId !== null &&
          contasIds.includes(
            transacao.contaDestinoId
          )

        // =================================================
        // ENTRADA
        // =================================================

        if (entrouNaConta && !saiuDaConta) {
          meses[mes].entradas += valor
          totalEntradas += valor
        }

        // =================================================
        // SAÍDA
        // =================================================

        if (saiuDaConta && !entrouNaConta) {
          meses[mes].saidas += valor
          totalSaidas += valor

          // ---------------------------------------------
          // CATEGORIA DO GASTO
          // ---------------------------------------------

          if (transacao.categoria) {
            const categoria =
              transacao.categoria

            categorias[categoria] =
              (categorias[categoria] || 0) +
              valor
          }
        }

        // =================================================
        // TRANSFERÊNCIA ENTRE CONTAS DO MESMO CLIENTE
        // =================================================

        if (saiuDaConta && entrouNaConta) {
          // Não entra nem sai do patrimônio total.
          //
          // Portanto:
          //
          // entrada = 0
          // saída   = 0
          //
          // A transferência apenas movimentou dinheiro
          // entre contas pertencentes ao mesmo cliente.
        }
      }

      // ---------------------------------------------------------
      // TRANSFORMA MESES EM ARRAY
      // ---------------------------------------------------------

      const mensal = Object.values(meses)
        .sort((a, b) =>
          a.mes.localeCompare(b.mes)
        )
        .map((mes) => ({
          ...mes,
          saldo:
            mes.entradas - mes.saidas,
        }))

      // ---------------------------------------------------------
      // MÉDIA
      // ---------------------------------------------------------

      const calcularMedia = (
        valores: number[]
      ): number => {
        if (valores.length === 0) {
          return 0
        }

        const soma = valores.reduce(
          (total, valor) =>
            total + valor,
          0
        )

        return soma / valores.length
      }

      // ---------------------------------------------------------
      // DESVIO PADRÃO POPULACIONAL
      // ---------------------------------------------------------

      const calcularDesvioPadrao = (
        valores: number[]
      ): number => {
        if (valores.length === 0) {
          return 0
        }

        const media =
          calcularMedia(valores)

        const variancia =
          valores.reduce(
            (total, valor) =>
              total +
              Math.pow(
                valor - media,
                2
              ),
            0
          ) / valores.length

        return Math.sqrt(variancia)
      }

      // ---------------------------------------------------------
      // ARRAYS PARA ESTATÍSTICA
      // ---------------------------------------------------------

      const valoresEntradas =
        mensal.map(
          (mes) => mes.entradas
        )

      const valoresSaidas =
        mensal.map(
          (mes) => mes.saidas
        )

      const valoresSaldo =
        mensal.map(
          (mes) => mes.saldo
        )

      // ---------------------------------------------------------
      // ESTATÍSTICAS
      // ---------------------------------------------------------

      const mediaEntradas =
        calcularMedia(
          valoresEntradas
        )

      const desvioPadraoEntradas =
        calcularDesvioPadrao(
          valoresEntradas
        )

      const mediaSaidas =
        calcularMedia(
          valoresSaidas
        )

      const desvioPadraoSaidas =
        calcularDesvioPadrao(
          valoresSaidas
        )

      const mediaSaldoMensal =
        calcularMedia(
          valoresSaldo
        )

      const desvioPadraoSaldoMensal =
        calcularDesvioPadrao(
          valoresSaldo
        )

      // ---------------------------------------------------------
      // GASTOS POR CATEGORIA
      // ---------------------------------------------------------

      const gastosPorCategoria =
        Object.entries(categorias)
          .map(
            ([categoria, valor]) => ({
              categoria,
              valor,
            })
          )
          .sort(
            (a, b) =>
              b.valor - a.valor
          )

      // ---------------------------------------------------------
      // MAIOR ENTRADA
      // ---------------------------------------------------------

      const maiorEntrada =
        mensal.length > 0
          ? mensal.reduce(
              (maior, atual) =>
                atual.entradas >
                maior.entradas
                  ? atual
                  : maior
            )
          : null

      // ---------------------------------------------------------
      // MAIOR SAÍDA
      // ---------------------------------------------------------

      const maiorSaida =
        mensal.length > 0
          ? mensal.reduce(
              (maior, atual) =>
                atual.saidas >
                maior.saidas
                  ? atual
                  : maior
            )
          : null

      // ---------------------------------------------------------
      // RESPOSTA
      // ---------------------------------------------------------

return response.status(200).json({
  resumo: {
    saldoTotal,
    totalEntradas,
    totalSaidas,
    saldoPeriodo:
      totalEntradas - totalSaidas,
  },

  mensal,

  estatisticas: {
    mediaEntradas,
    desvioPadraoEntradas,

    mediaSaidas,
    desvioPadraoSaidas,

    mediaSaldoMensal,
    desvioPadraoSaldoMensal,
  },

  categorias: gastosPorCategoria,

  maiorEntrada,
  maiorSaida,

  transacoes,
})
    } catch (e) {
      console.error(
        "[transacoes.analiseFinanceiraCliente] erro:",
        e
      )

      return handleErrors(e, response)
    }
  },


}