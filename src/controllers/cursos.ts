import { Request, Response } from "express"
import { prisma } from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"


export default{
    list: async (request: Request, response: Response) => {
        try{
            const users = await prisma.cursos.findMany()
            return response.status(200).json(users)
        } catch (e) {
        return handleErrors(e, response)
    }
    },

    create : async (request: Request, response: Response) => {
        try{
            const {nome, professor, cargaHoraria, descricao} = request.body
            const user = await prisma.cursos.create({
                data: {
                    nome,
                    professor,
                    cargaHoraria,
                    descricao
                }
            })
            console.log("Created user")
            return response.status(201).json(user)
        } catch (e) {
        return handleErrors(e, response)
    }
    },
    
    update: async(request: Request, response: Response) => {
        try{
            const { id } = request.params
            const {nome, professor, cargaHoraria, descricao} = request.body

            const user = await prisma.cursos.update({
                data: {
                nome,
                professor,
                cargaHoraria,
                descricao
            },
            where: {id: +id}
            })
            console.log("Usuario atualizado")
            return response.status(201).json(user)
        } catch (e){
             return handleErrors(e, response)
        }
    },

    getById: async (request: Request, response: Response) => {
        try{
        const {id} = request.params
        const user = await prisma.cursos.findUnique({where: {id: +id}})
        return response.status(200).json(user)
        } catch (e) {
        return handleErrors(e, response)
    }
    },

    deleteById: async (request: Request, response: Response) => {
        try {
        const {id} = request.params

        const user = await prisma.cursos.delete({
            where: {id: +id}
        })
        console.log("Usuario deletado")
         return response.status(200).json(user)
         } catch (e) {
        return handleErrors(e, response)
    }
    }   
}