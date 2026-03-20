import { Request, Response } from "express"

import { prisma } from "../../config/prisma"
import prismaErrorCodes from "../../config/prismaErrorCodes.json"
import { Prisma } from "../../generated/prisma/client"


export default {
    list: async (request: Request, response: Response) => {
        try{
        const users = await prisma.alunos.findMany({
            include: { cursos: true}
        })
        return response.status(200).json(users);
        } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            // @ts-ignore
            return response.status(prismaErrorCodes[e.code] || 500).json(e.message)
        }
        return response.status(500).json("Unknown error. Try again later")
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
    console.log("Created user:", user)
    return response.status(201).json(user)
    } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            // @ts-ignore
            return response.status(prismaErrorCodes[e.code] || 500).json(e.message)
        }
        return response.status(500).json("Unknown error. Try again later")
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
        console.log("Usuario atualizado")
        return response.status(201).json(user)
        } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            // @ts-ignore
            return response.status(prismaErrorCodes[e.code] || 500).json(e.message)
        }
        return response.status(500).json("Unknown error. Try again later")
    }
    },

    getById: async (request: Request, response: Response) => {
        try{
        const {id} = request.params
        const user = await prisma.alunos.findUnique({where: {id: +id}})
        return response.status(200).json(user)
        } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            // @ts-ignore
            return response.status(prismaErrorCodes[e.code] || 500).json(e.message)
        }
        return response.status(500).json("Unknown error. Try again later")
    }
    },

    deleteById: async (request: Request, response: Response) => {
        try {
        const {id} = request.params

        const user = await prisma.alunos.delete({
            where: {id: +id}
        })
        console.log("Usuario deletado")
         return response.status(200).json(user)
         } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            // @ts-ignore
            return response.status(prismaErrorCodes[e.code] || 500).json(e.message)
        }
        return response.status(500).json("Unknown error. Try again later")
    }
    },
     Conectar: async(request: Request, response: Response) => {
        try{
        const { id } = request.params

        const user = await prisma.alunos.update({
            where: {id: +id},
            data: {
                cursos: {
                    connect: { id: 4}
                }
            },
        })
        console.log("Usuario atualizado")
        return response.status(201).json(user)
        } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            // @ts-ignore
            return response.status(prismaErrorCodes[e.code] || 500).json(e.message)
        }
        return response.status(500).json("Unknown error. Try again later")
    }
    },   
    Desconectar: async(request: Request, response: Response) => {
        try{
        const { id } = request.params

        const user = await prisma.alunos.update({
            where: {id: +id},
            data: {
                cursos: {
                    disconnect: { id: 4}
                }
            },
        })
        console.log("Usuario atualizado")
        return response.status(201).json(user)
        } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            // @ts-ignore
            return response.status(prismaErrorCodes[e.code] || 500).json(e.message)
        }
        return response.status(500).json("Unknown error. Try again later")
    }
    }
}