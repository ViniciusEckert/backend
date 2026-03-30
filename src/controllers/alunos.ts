import { Request, Response } from "express"

import { prisma } from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"


export default {
    list: async (request: Request, response: Response) => {
        try{
        const users = await prisma.alunos.findMany({
            include: { cursos: true}
        })
        return response.status(200).json(users);
        } catch (e) {
        return handleErrors(e, response)
    }
    },

    create: async (request: Request, response: Response) => {
        try {
        const { nome, cpf, email, idade } = request.body
        const user = await prisma.alunos.create({
        data: {
            nome,
            idade,
            cpf,
            email
        }
    })
    return response.status(201).json(user)
    } catch (e) {
        return handleErrors(e, response)
    }
    },

    update: async(request: Request, response: Response) => {
        try{
        const { id } = request.params
        const { nome, cpf, email, idade } = request.body

        const user = await prisma.alunos.update({
            data: {
                nome,
                idade,
                email,
                cpf
            },
            where: {id: +id}
        })
        return response.status(201).json(user)
        } catch (e) {
        return handleErrors(e, response)
    }
    },

    getById: async (request: Request, response: Response) => {
        try{
        const {id} = request.params
        const user = await prisma.alunos.findUnique({where: {id: +id}})
        return response.status(200).json(user)
        } catch (e) {
        return handleErrors(e, response)
    }
    },

    deleteById: async (request: Request, response: Response) => {
        try {
        const {id} = request.params

        const user = await prisma.alunos.delete({
            where: {id: +id}
        })
         return response.status(200).json(user)
         } catch (e) {
        return handleErrors(e, response)
    }
    },
     Conectar: async(request: Request, response: Response) => {
        try{
        const { id } = request.params
        const { cursoIds } = request.body

        const user = await prisma.alunos.update({
            where: {id: +id},
            data: {
                cursos: {
                    connect: cursoIds.map((cursoIds:Number) => ({id: cursoIds}))
                }
            },
        })
        return response.status(201).json(user)
        } catch (e) {
        return handleErrors(e, response)
    }
    },   
    Desconectar: async(request: Request, response: Response) => {
        try{
        const { id } = request.params
        const { cursoIds } = request.body

        const user = await prisma.alunos.update({
            where: {id: +id},
            data: {
                cursos: {
                    disconnect: { id: +cursoIds }
                }
            },
        })
        return response.status(201).json(user)
        } catch (e) {
        return handleErrors(e, response)
    }
    }
}