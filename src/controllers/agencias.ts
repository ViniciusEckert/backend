import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { handleErrors } from "../helpers/handleErros";

export default {
    list: async (request: Request, response: Response) => {
        try{
            const users = await prisma.agencia.findMany()
            return response.status(200).json(users)
        } catch(e) {
            return handleErrors(e, response)
        }
    },

    create: async (request: Request, response: Response) => {
        try{
            const {nome, numero, endereco} = request.body

            if(!nome || !numero || !endereco ){
                return response.status(400).json("Dados da agencia faltando")
            }
            const user = await prisma.agencia.create({
                data: {
                    nome,
                    numero,
                    endereco
                }
            })
            return response.status(201).json(user)
        }catch(e) {
            return handleErrors(e, response)
        }
    },

    update: async(request: Request, response: Response) => {
        try{
            const { id } = request.params
            const {nome, numero, endereco} = request.body

            const user = await prisma.agencia.update({
                data: {
                    nome,
                    numero,
                    endereco
                },
                where: {id: +id}
            })
            return response.status(200).json(user)
        } catch(e) {
            return handleErrors(e, response)
        }
    },

    delete: async (request: Request, response: Response) => {
        try{
            const {id} =request.params

            const user = await prisma.agencia.delete({
                where: {id: +id}
            })
            return response.status(200).json(user)
        } catch (e) {
            return handleErrors(e, response)
        }
    },

    conectarFunc: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const { funcionarioIds } = request.body

            const user = await prisma.agencia.update({
                where: {id: +id},
                data: {
                    funcionarios: {
                        connect: funcionarioIds.map((funcionarioIds:Number) => ({id: funcionarioIds}))
                    }
                }
            })
            return response.status(200).json(user)
        } catch(e) {
            return handleErrors(e, response)
        }
    },

    desconectarFunc: async(request: Request, response: Response) => {
        try{
            const { id } = request.params
            const { funcionarioIds } = request.body

            const user = await prisma.agencia.update({
                where: {id: +id},
                data: {
                    funcionarios: {
                        disconnect: {id: +funcionarioIds }
                    }
                }
            })
            return response.status(200).json(user)
        } catch (e) {
            return handleErrors(e, response)
        }
    },

    conectarConta: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const { contasIds } = request.body

            const user = await prisma.agencia.update({
                where: {id: +id},
                data: {
                    contas: {
                        connect: contasIds.map((contasIds:Number) => ({id: contasIds}))
                    }
                }
            })
            return response.status(200).json(user)
        } catch(e) {
            return handleErrors(e, response)
        }
    },

    desconectarConta: async(request: Request, response: Response) => {
        try{
            const { id } = request.params
            const { contaIds } = request.body

            const user = await prisma.agencia.update({
                where: {id: +id},
                data: {
                    contas: {
                        disconnect: {id: +contaIds }
                    }
                }
            })
            return response.status(200).json(user)
        } catch (e) {
            return handleErrors(e, response)
        }
    },

    getById: async (request: Request, response: Response) => {
        try{
            const {id} = request.params
            const user = await prisma.agencia.findUnique({where: {id: +id}})
            return response.status(200).json(user)
        } catch (e) {
            return handleErrors(e, response)
        }
    }
}