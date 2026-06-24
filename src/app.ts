import express from "express";
import cors from "cors";
import routes from "./routes"
import {serve, setup} from "swagger-ui-express"
import packageJson from "../package.json"
import swaggerConfig from "../config/swaggerConfig";

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())


app.use(routes)

//configura a documentação
app.use("/docs", serve, setup({
    openapi: "3.2.0",
    info: {
        title: packageJson.name,
        version: packageJson.version,
        description: packageJson.description
    },
    servers: [{
        url: "http://localhost:8080"
    },],
    paths: {
        "/": swaggerConfig.initialRoute,
        "/clientes": swaggerConfig.clientesRoutes
    },
    tags: [
        {
            nome: "Clientes",
            description: "CRUD de clientes"
        },
        {
            nome: "Rota inicial",
            description: "checar funcionamento do servidor"
        },
    ],
    components: {
        schemas: {
            Clientes: swaggerConfig.clientesSchema
            
        }
    }
}))

export default app