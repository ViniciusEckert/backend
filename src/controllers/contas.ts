import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { handleErrors } from "../helpers/handleErros";

export default {
  create: async (request: Request, response: Response) => {
    try {
      const {
        senha,
        tipo_conta,
        saldo,
        pix,
        data_abertura,
        clienteIds,
        agenciaIds,
      } = request.body;

      if (!senha || !tipo_conta) {
        return response.status(400).json("Dados incompletos.");
      }

      const conta = await prisma.conta.create({
        data: {
          senha,
          tipo_conta,
          saldo: saldo ?? 0,
          pix: pix ?? null,
          data_abertura: data_abertura
            ? new Date(data_abertura)
            : new Date(),

          clientes: clienteIds
            ? {
                connect: clienteIds.map((id: number) => ({
                  id: Number(id),
                })),
              }
            : undefined,

          agencias: agenciaIds
            ? {
                connect: agenciaIds.map((id: number) => ({
                  id: Number(id),
                })),
              }
            : undefined,
        },
        include: {
          clientes: true,
          agencias: true,
        },
      });

      return response.status(201).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  getByPix: async (request: Request, response: Response) => {
    try {
      const chaveParam = request.params.chave;

      const chave = Array.isArray(chaveParam)
        ? chaveParam[0]
        : chaveParam;

      const conta = await prisma.conta.findFirst({
        where: {
          pix: chave,
        },
        include: {
          clientes: true,
        },
      });

      if (!conta) {
        return response.status(404).json({ erro: "Conta não encontrada" });
      }

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  list: async (request: Request, response: Response) => {
    try {
      const contas = await prisma.conta.findMany({
        include: {
          clientes: true,
          agencias: true,
          cartoes: true,
          transacoesOrigem: true,
          transacoesDestino: true,
        },
      });

      return response.status(200).json(contas);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  getById: async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    const conta = await prisma.conta.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        clientes: true,
        agencias: true,
        cartoes: true,
        transacoesOrigem: true,
        transacoesDestino: true,
      },
    });

    if (!conta) {
      return response.status(404).json({
        erro: "Conta não encontrada",
      });
    }

    const contaFormatada = {
      ...conta,
      transacoes: [
        ...(conta.transacoesOrigem || []).map((t) => ({
          id: t.id,
          valor: -Number(t.valor), // 💸 saída
          tipo: t.tipo,
          data: t.dataTransacao.toISOString(), // ✅ nome correto
          descricao: t.descricao,
        })),
        ...(conta.transacoesDestino || []).map((t) => ({
          id: t.id,
          valor: Number(t.valor), // 💰 entrada
          tipo: t.tipo,
          data: t.dataTransacao.toISOString(), // ✅ nome correto
          descricao: t.descricao,
        })),
      ].sort(
        (a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
      ),
    };

    return response.status(200).json(contaFormatada);
  } catch (e) {
    return handleErrors(e, response);
  }
},

  update: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { saldo, tipo_conta, senha, pix } = request.body;

      const conta = await prisma.conta.update({
        where: {
          id: Number(id),
        },
        data: {
          saldo,
          tipo_conta,
          senha,
          pix,
        },
      });

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  clientConnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { clienteId } = request.body;

      const conta = await prisma.conta.update({
        where: {
          id: Number(id),
        },
        data: {
          clientes: {
            connect: clienteId.map((id: number) => ({
              id: Number(id),
            })),
          },
        },
        include: {
          clientes: true,
        },
      });

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  clientDisconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { clienteId } = request.body;

      const conta = await prisma.conta.update({
        where: {
          id: Number(id),
        },
        data: {
          clientes: {
            disconnect: clienteId.map((id: number) => ({
              id: Number(id),
            })),
          },
        },
        include: {
          clientes: true,
        },
      });

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  agenciaConnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { agenciaId } = request.body;

      const conta = await prisma.conta.update({
        where: {
          id: Number(id),
        },
        data: {
          agencias: {
            connect: agenciaId.map((id: number) => ({
              id: Number(id),
            })),
          },
        },
        include: {
          agencias: true,
        },
      });

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  agenciaDisconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { agenciaId } = request.body;

      const conta = await prisma.conta.update({
        where: {
          id: Number(id),
        },
        data: {
          agencias: {
            disconnect: agenciaId.map((id: number) => ({
              id: Number(id),
            })),
          },
        },
        include: {
          agencias: true,
        },
      });

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  cartaoConnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { cartaoId } = request.body;

      const conta = await prisma.conta.update({
        where: {
          id: Number(id),
        },
        data: {
          cartoes: {
            connect: cartaoId.map((id: number) => ({
              id: Number(id),
            })),
          },
        },
        include: {
          cartoes: true,
        },
      });

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  cartaoDisconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { cartaoId } = request.body;

      const conta = await prisma.conta.update({
        where: {
          id: Number(id),
        },
        data: {
          cartoes: {
            disconnect: cartaoId.map((id: number) => ({
              id: Number(id),
            })),
          },
        },
        include: {
          cartoes: true,
        },
      });

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },

  delete: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;

      const conta = await prisma.conta.delete({
        where: {
          id: Number(id),
        },
      });

      return response.status(200).json(conta);
    } catch (e) {
      return handleErrors(e, response);
    }
  },
};