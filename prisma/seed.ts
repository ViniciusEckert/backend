import bcrypt from 'bcrypt'
import { prisma } from "../config/prisma"

async function main(){


    const employee = await prisma.funcionario.create({
        data:{
            nome:"funcionario1",
            email:"funcionario1@teste",
            senha: bcrypt.hashSync("123456", +process.env.BCRYPT_ROUNDS!),
            admin: true
        },
    })
    console.log("funcionario criado", employee)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async() => {
        await prisma.$disconnect()
    })