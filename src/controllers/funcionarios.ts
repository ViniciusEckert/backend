import {Request, Response} from "express"
import {prisma} from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export default {
    login: async(request: Request, response: Response) =>{
        try{
            const {email, senha} = request.body
            const employee = await prisma.funcionario.findUnique({
                where:{
                    email,
                }
            })

            if(!employee || !bcrypt.compareSync(senha, employee.senha)){
                return response.status(404).json("Email e/ou senha inválidos")
            }

            console.log("teste");
            const token = jwt.sign(employee, process.env.JWT_SECRET!, {
                expiresIn: "1d"
            })

            return response.status(200).json({access_token: token})

        }catch(e){
            console.error(e);
            return response.status(401).json()
        }
    },

    create: async (request: Request, response: Response) => {
        try{
            const { nome, email, admin, senha, agenciaIds } = request.body
            
            if(!nome || !email || !senha){
                return response.status(400).json("Dados incompletos.")
            }

            const data: any = {
                nome,
                email,
                admin: admin || false,
                senha
            }

            if(agenciaIds) {
                data.agencias = { connect: agenciaIds.map((id: number) => ({ id })) }
            }

            const funcionario = await prisma.funcionario.create({
                data
            })
            return response.status(201).json(funcionario)
        }catch(e){
            return handleErrors(e, response)
        }
    },

    list: async (request: Request, response: Response) => {
        try{
            const funcionarios = await prisma.funcionario.findMany({
                include: { agencias: true }
            })
            return response.status(200).json(funcionarios)
        }catch(e){
            handleErrors(e, response)
        }
    },

    getById: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const funcionario = await prisma.funcionario.findUnique({
                include: { agencias: true },
                where: { id: +id }
            })
            return response.status(200).json(funcionario)
        }catch(e){
            handleErrors(e, response)
        }
    },

    update: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const { nome, email, admin, Senha } = request.body

            const funcionario = await prisma.funcionario.update({
                data: {
                    nome,
                    email,
                    admin,
                    Senha
                },
                where: { id: +id }
            })
            return response.status(200).json(funcionario)
        }catch(e){
            handleErrors(e, response)
        }
    },

    delete: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const funcionario = await prisma.funcionario.delete({ where: { id: +id } })
            return response.status(200).json(funcionario)
        }catch(e){
            handleErrors(e, response)
        }
    }
}