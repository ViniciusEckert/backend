import http from "http"
import app from "./app"
import cron from "node-cron"
import { aplicarRendimentoPoupanca } from "./services/rendimentoPoupanca"

cron.schedule("0 0 * * *", async () => {
  try {
    const resultado = await aplicarRendimentoPoupanca()
    console.log(`[rendimento] ${resultado.processadas}/${resultado.total} contas processadas`)
  } catch (err) {
    console.error("[rendimento] falhou:", err)
  }
})

const server = http.createServer(app)

server.listen(8080, ()=> console.log("Servidor escutando na porta 8080"))