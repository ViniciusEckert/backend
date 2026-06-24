import {Request, Response} from "express"
import {prisma} from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"

export default {
    create: async (request: Request, response: Response) => {
        try{
            const { senha, tipo_conta, data_abertura, clienteIds, agenciaIds } = request.body
            
            // Validações básicas
            if(!senha || !tipo_conta){
                return response.status(400).json("Dados incompletos.")
            }

            const data: any = {
                senha,
                tipo_conta, // Ex: "CORRENTE"
                data_abertura: data_abertura || new Date()
            }

            // Conectando relaçõesmany-to-many se existirem
            if(clienteIds) {
                data.clientes = { connect: clienteIds.map((id: number) => ({ id })) }
            }
            if(agenciaIds) {
                data.agencias = { connect: agenciaIds.map((id: number) => ({ id })) }
            }

            const conta = await prisma.conta.create({
                data
            })
            return response.status(201).json(conta)
        }catch(e){
            return handleErrors(e, response)
        }
    },

    list: async (request: Request, response: Response) => {
        try{
            const conta = await prisma.conta.findMany({
                include: {
                    clientes: true,
                    transacoes: true,
                    cartoes: true
                }
            })
            return response.status(200).json(conta)
        }catch(e){
            handleErrors(e, response)
        }
    },

    getById: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const conta = await prisma.conta.findUnique({
                where: { id: +id },
                include: {
                    clientes: true,
                    agencias: true,
                    transacoes: true,
                    cartoes: true
                }
            })
            return response.status(200).json(conta)
        }catch(e){
            handleErrors(e, response)
        }
    },

    update: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const { saldo, tipo_conta, senha } = request.body

            const conta = await prisma.conta.update({
                data: {
                    saldo,
                    tipo_conta,
                    senha
                },
                where: { id: +id }
            })
            return response.status(200).json(conta)
        }catch(e){
            handleErrors(e, response)
        }
    },

    clientConnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {clienteId} = request.body

            const contas = await prisma.cliente.update({
                where: { id: +id },
                data: {
                    cliente: {
                        connect: clienteId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(contas)
        }catch(e){
            handleErrors(e, response)
        }
    },

    clientDisconnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {clienteId} = request.body

            const cliente = await prisma.cliente.update({
                where: { id: +id },
                data: {
                    cliente: {
                        disconnect: clienteId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cliente)
        }catch(e){
            handleErrors(e, response)
        }
    },

    agenciaConnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {agenciaId} = request.body

            const cliente = await prisma.cliente.update({
                where: { id: +id },
                data: {
                    agencia: {
                        connect: agenciaId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cliente)
        }catch(e){
            handleErrors(e, response)
        }
    },

    agenciaDisconnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {agenciaId} = request.body

            const cliente = await prisma.cliente.update({
                where: { id: +id },
                data: {
                    agencia: {
                        disconnect: agenciaId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cliente)
        }catch(e){
            handleErrors(e, response)
        }
    },

    transConnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {transacaoId} = request.body

            const cliente = await prisma.cliente.update({
                where: { id: +id },
                data: {
                    transacao: {
                        connect: transacaoId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cliente)
        }catch(e){
            handleErrors(e, response)
        }
    },

    transDisconnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {transacaoId} = request.body

            const cliente = await prisma.cliente.update({
                where: { id: +id },
                data: {
                    transacao: {
                        disconnect: transacaoId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cliente)
        }catch(e){
            handleErrors(e, response)
        }
    },

    cartaoConnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {cartaoId} = request.body

            const cliente = await prisma.cliente.update({
                where: { id: +id },
                data: {
                    cartao: {
                        connect: cartaoId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cliente)
        }catch(e){
            handleErrors(e, response)
        }
    },

    cartaoDisconnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {cartaoId} = request.body

            const cliente = await prisma.cliente.update({
                where: { id: +id },
                data: {
                    cartao: {
                        disconnect: cartaoId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cliente)
        }catch(e){
            handleErrors(e, response)
        }
    },

    delete: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const conta = await prisma.conta.delete({ where: { id: +id } })
            return response.status(200).json(conta)
        }catch(e){
            handleErrors(e, response)
        }
    }
}