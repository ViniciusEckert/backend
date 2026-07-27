import {Request, Response} from "express"
import {prisma} from "../../config/prisma"
import { handleErrors } from "../helpers/handleErros"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export default {
    login: async(request: Request, response: Response) =>{
        try{
            const {cpf, senha} = request.body
            const employee = await prisma.cliente.findUnique({
                where:{
                    cpf,
                }
            })

            if(!employee || !bcrypt.compareSync(senha, employee.senha)){
                return response.status(404).json("CPF e/ou senha inválidos")
            }

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
            const  {nome, email, cpf, data_nascimento, telefone, senha } = request.body
            if(!nome || !email || !cpf || !data_nascimento || !telefone){
                return response.status(400).json("Dados Incompletos.")
            }
            
            const user = await prisma.cliente.create({
                data:{
                    nome,
                    email,
                    cpf,
                    data_nascimento,
                    telefone,
                    senha: bcrypt.hashSync(senha, +process.env.BCRYPT_ROUNDS!)
                }
            })
            console.log("usuario criado")
            return response.status(201).json(user)
        }catch(e){
            return handleErrors(e, response)
        }
    },

    list: async(request: Request, response: Response) => {
        try{
            const user = await prisma.cliente.findMany({
                include: {contas: true}
            })
            return response.status(200).json(user)

        }catch(e){
            handleErrors(e, response)
        }
    },
    
    getById: async (request: Request, response: Response) => {
        try{
            const { id } = request.params
            const user = await prisma.cliente.findUnique({
                where: {
                    id: +id
                },
                include: {
                    contas: {
                        include: {
                            cartoes: true,
                            transacoes: true
                        }
                    }
                }
            })
            return response.status(200).json(user)
        }catch(e){
            handleErrors(e, response)
        }
    },


    update: async(request: Request, response: Response) => {
        try{
            const {id} = request.params

            const { nome, email, cpf, data_nascimento, telefone, senha} = request.body

            const user = await prisma.cliente.update({

                data: {
                    nome,
                    email,
                    cpf,
                    data_nascimento,
                    telefone,
                    senha
                },                
                where:{
                    id: +id
                },
 
            })
            return response.status(200).json(user)
        }catch(e){
            handleErrors(e, response)
        }
    },
    
    delete: async(request: Request, response: Response) => {
        try{
            const {id} = request.params

            const user = await prisma.cliente.delete({where:{ id: +id}})

            return response.status(200).json(user)
        }catch(e){
            handleErrors(e, response)
        }
    },


    connect: async (request: Request, response: Response) => {
        try {
            const { id } = request.params;
            const { contaId } = request.body;

            const user = await prisma.cliente.update({
                where: {
                    id: +id
                },
                data: {
                    contas: {
                        connect: contaId.map((id: number) => ({ id }))
                    }
                }
            });

            return response.status(200).json(user);
        } catch (e) {
            return handleErrors(e, response);
        }
    },

    disconnect: async(request: Request, response: Response) => {
        try{
            const {id} = request.params
            const {contaId} = request.body

            const user = await prisma.cliente.update({
                where:{id: +id},
                data:{
                    contas:{
                        disconnect: contaId.map((contaId: Number) => ({id: contaId}))
                    }
                }
            })
        }
        catch(e) {
            handleErrors(e, response)
        
        }
    } 
}