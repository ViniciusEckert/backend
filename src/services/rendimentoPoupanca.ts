import { prisma } from "../../config/prisma"

// Taxa mensal simplificada. A regra oficial (Selic > 8,5% a.a. → 0,5% +
// TR; Selic <= 8,5% a.a. → 70% da Selic + TR) exige acompanhar a Selic e
// a TR em tempo real — como não temos essa fonte de dados, deixamos a
// taxa mensal configurável aqui, já refletindo a soma "juro + TR" que
// você decidir aplicar.
const TAXA_MENSAL = Number(process.env.TAXA_POUPANCA_MENSAL ?? "0.005") // 0,5% ao mês

// Ciclo de rendimento: 1 dia (em vez dos 30 dias reais), só pra
// facilitar a demonstração do TCC. A taxa continua sendo a "taxa
// mensal" mesmo assim — em produção real, isso deveria voltar a ser
// 30 dias.
const DURACAO_CICLO_MS = 1 * 24 * 60 * 60 * 1000

export async function aplicarRendimentoPoupanca() {
  const contas = await prisma.conta.findMany({
    where: { tipo_conta: "POUPANCA" },
  })

  const agora = new Date()
  let processadas = 0

  for (const conta of contas) {
    const ultimaData = conta.ultimoRendimento ?? conta.data_abertura
    const cicloCompleto = agora.getTime() - ultimaData.getTime() >= DURACAO_CICLO_MS

    if (!cicloCompleto) continue
    if (Number(conta.saldo) <= 0) continue

    const rendimento = Number(conta.saldo) * TAXA_MENSAL

    await prisma.$transaction(async (tx) => {
      await tx.conta.update({
        where: { id: conta.id },
        data: {
          saldo: { increment: rendimento },
          ultimoRendimento: agora,
        },
      })

      await tx.transacao.create({
        data: {
          tipo: "RENDIMENTO",
          valor: rendimento,
          descricao: "Rendimento da poupança",
          dataTransacao: agora,
          contaDestino: { connect: { id: conta.id } },
        },
      })
    })

    processadas++
  }

  return { processadas, total: contas.length }
}