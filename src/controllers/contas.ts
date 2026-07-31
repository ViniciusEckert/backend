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
          data_abertura: data_abertura
            ? new Date(data_abertura)
            : new Date(),
          pix,

          ...(clienteIds && {
            clientes: {
              connect: clienteIds.map((id: number) => ({
                id: Number(id),
              })),
            },

            agencias: agenciaIds
              ? {
                  connect: agenciaIds.map((id: number) => ({
                    id: Number(id),
                  })),
                }
              : undefined,
          }),
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
  list: async (request: Request, response: Response) => {
    try {
      const conta = await prisma.conta.findMany({
        include: {
          clientes: true,
          transacoes: true,
          cartoes: true,
        },
      });
      return response.status(200).json(conta);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  getById: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const conta = await prisma.conta.findUnique({
        where: { id: +id },
        include: {
          clientes: true,
          agencias: true,
          transacoes: true,
          cartoes: true,
        },
      });
      return response.status(200).json(conta);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  update: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { saldo, tipo_conta, senha } = request.body;

      const conta = await prisma.conta.update({
        data: {
          saldo,
          tipo_conta,
          senha,
        },
        where: { id: +id },
      });
      return response.status(200).json(conta);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  clientConnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { clienteId } = request.body;

      const contas = await prisma.conta.update({
        where: { id: +id },
        data: {
          cliente: {
            connect: clienteId.map((id: number) => ({ id })),
          },
        },
      });
      return response.status(200).json(contas);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  clientDisconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { clienteId } = request.body;

      const cliente = await prisma.conta.update({
        where: { id: +id },
        data: {
          cliente: {
            disconnect: clienteId.map((id: number) => ({ id })),
          },
        },
      });
      return response.status(200).json(cliente);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  agenciaConnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { agenciaId } = request.body;

      const cliente = await prisma.conta.update({
        where: { id: +id },
        data: {
          agencia: {
            connect: agenciaId.map((id: number) => ({ id })),
          },
        },
      });
      return response.status(200).json(cliente);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  agenciaDisconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { agenciaId } = request.body;

      const cliente = await prisma.conta.update({
        where: { id: +id },
        data: {
          agencia: {
            disconnect: agenciaId.map((id: number) => ({ id })),
          },
        },
      });
      return response.status(200).json(cliente);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  transConnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { transacaoId } = request.body;

      const cliente = await prisma.conta.update({
        where: { id: +id },
        data: {
          transacao: {
            connect: transacaoId.map((id: number) => ({ id })),
          },
        },
      });
      return response.status(200).json(cliente);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  transDisconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { transacaoId } = request.body;

      const cliente = await prisma.conta.update({
        where: { id: +id },
        data: {
          transacao: {
            disconnect: transacaoId.map((id: number) => ({ id })),
          },
        },
      });
      return response.status(200).json(cliente);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  cartaoConnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { cartaoId } = request.body;

      const cliente = await prisma.conta.update({
        where: { id: +id },
        data: {
          cartao: {
            connect: cartaoId.map((id: number) => ({ id })),
          },
        },
      });
      return response.status(200).json(cliente);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  cartaoDisconnect: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const { cartaoId } = request.body;

      const cliente = await prisma.conta.update({
        where: { id: +id },
        data: {
          cartao: {
            disconnect: cartaoId.map((id: number) => ({ id })),
          },
        },
      });
      return response.status(200).json(cliente);
    } catch (e) {
      handleErrors(e, response);
    }
  },

  delete: async (request: Request, response: Response) => {
    try {
      const { id } = request.params;
      const conta = await prisma.cliente.delete({ where: { id: +id } });
      return response.status(200).json(conta);
    } catch (e) {
      handleErrors(e, response);
    }
  },
};
