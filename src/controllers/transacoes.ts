import {Request, Response} from "express"
import {prisma} from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"

export default {
    create: async (request: Request, response: Response) => {
        try{
            const { tipo, valor, dataTransacao, contaIds } = request.body
            
            if(!tipo || !valor){
                return response.status(400).json("Dados incompletos.")
            }

            const data: any = {
                tipo,
                valor,
                dataTransacao: dataTransacao || new Date()
            }

            if(contaIds) {
                data.conta = { connect: contaIds.map((id: number) => ({ id })) }
            }

            const transacao = await prisma.transacao.create({
                data
            })
            return response.status(201).json(transacao)
        }catch(e){
            return handleErrors(e, response)
        }
    },

    list: async (request: Request, response: Response) => {
        try{
            const transacoes = await prisma.transacao.findMany({
                include: { conta: true }
            })
            return response.status(200).json(transacoes)
        }catch(e){
            handleErrors(e, response)
        }
    },

    getById: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const transacao = await prisma.transacao.findUnique({
                where: { id: +id },
                include: { conta: true }
            })
            return response.status(200).json(transacao)
        }catch(e){
            handleErrors(e, response)
        }
    },

    update: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const { tipo, valor, dataTransacao } = request.body

            const data: any = {}
            if(tipo) data.tipo = tipo
            if(valor) data.valor = valor
            if(dataTransacao) data.dataTransacao = new Date(dataTransacao)

            const transacao = await prisma.transacao.update({
                data,
                where: { id: +id }
            })
            return response.status(200).json(transacao)
        }catch(e){
            handleErrors(e, response)
        }
    },

    delete: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const transacao = await prisma.transacao.delete({ where: { id: +id } })
            return response.status(200).json(transacao)
        }catch(e){
            handleErrors(e, response)
        }
    },

    connect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {contaId} = request.body

            const transacao = await prisma.transacao.update({
                where: { id: +id },
                data: {
                    conta: {
                        connect: contaId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(transacao)
        }catch(e){
            handleErrors(e, response)
        }
    },

    disconnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {contaId} = request.body

            const transacao = await prisma.transacao.update({
                where: { id: +id },
                data: {
                    conta: {
                        disconnect: contaId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(transacao)
        }catch(e){
            handleErrors(e, response)
        }
    }
}