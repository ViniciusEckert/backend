import {Request, Response} from "express"
import {prisma} from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"

export default {
    create: async (request: Request, response: Response) => {
        try{
            const { numero_cartao, tipo_cartao, cvv, validade, contaIds } = request.body
            
            if(!numero_cartao || !tipo_cartao || !cvv || !validade){
                return response.status(400).json("Dados incompletos.")
            }

            const data: any = {
                numero_cartao,
                tipo_cartao, // Ex: "CREDITO"
                cvv,
                validade: new Date(validade)
            }

            if(contaIds) {
                data.conta = { connect: contaIds.map((id: number) => ({ id })) }
            }

            const cartao = await prisma.cartao.create({
                data
            })
            return response.status(201).json(cartao)
        }catch(e){
            return handleErrors(e, response)
        }
    },

    list: async (request: Request, response: Response) => {
        try{
            const cartoes = await prisma.cartao.findMany({
                include: { conta: true }
            })
            return response.status(200).json(cartoes)
        }catch(e){
            handleErrors(e, response)
        }
    },

    getById: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const cartao = await prisma.cartao.findUnique({
                where: { id: +id },
                include: { conta: true }
            })
            return response.status(200).json(cartao)
        }catch(e){
            handleErrors(e, response)
        }
    },

    update: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const { numero_cartao, tipo_cartao, cvv, validade } = request.body

            const data: any = {}
            if(numero_cartao) data.numero_cartao = numero_cartao
            if(tipo_cartao) data.tipo_cartao = tipo_cartao
            if(cvv) data.cvv = cvv
            if(validade) data.validade = new Date(validade)

            const cartao = await prisma.cartao.update({
                data,
                where: { id: +id }
            })
            return response.status(200).json(cartao)
        }catch(e){
            handleErrors(e, response)
        }
    },

    delete: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const cartao = await prisma.cartao.delete({ where: { id: +id } })
            return response.status(200).json(cartao)
        }catch(e){
            handleErrors(e, response)
        }
    },

    connect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {contaId} = request.body

            const cartao = await prisma.cartao.update({
                where: { id: +id },
                data: {
                    conta: {
                        connect: contaId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cartao)
        }catch(e){
            handleErrors(e, response)
        }
    },

    disconnect: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {contaId} = request.body

            const cartao = await prisma.cartao.update({
                where: { id: +id },
                data: {
                    conta: {
                        disconnect: contaId.map((id: number) => ({id}))
                    }
                }
            })
            return response.status(200).json(cartao)
        }catch(e){
            handleErrors(e, response)
        }
    }
}