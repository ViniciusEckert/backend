import bcrypt from "bcrypt";
import { prisma } from "../config/prisma"


async function main() {
  const employee = await prisma.funcionarios.create({
    data: {
      nome: "Funcionario",
      email: "funcionario@gmail.com",
      senha: bcrypt.hashSync("123456", +process.env.BCRYPT_ROUNDS!),
      admin: true,
    },
  });

  console.log("Funcionario criado:", employee);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
