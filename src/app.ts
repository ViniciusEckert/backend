import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express()

//regras do servidor
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

//configura as rotas do servidor
app.use(routes)

export default app;