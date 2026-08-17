import express from "express";
import cors from "cors";
import routes from "./routes";
import { serve, setup } from "swagger-ui-express";
import swaggerConfig from "../config/swaggerConfig";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rotas da API
app.use(routes);

// Documentação Swagger
app.use("/docs", serve, setup(swaggerConfig));

export default app;