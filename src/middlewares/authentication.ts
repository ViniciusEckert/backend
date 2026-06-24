import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { Funcionario } from "../../generated/prisma/client";

export function authentication(request: Request, response: Response, next: NextFunction) {
    try {
        const authHeader = request.headers.authorization

        if (!authHeader) {
            return response.status(401).json("Não autenticado")
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        if (!request.body) {
            request.body = {}
        }
        request.body.user = decoded as Funcionario;
        
        next();
    } catch(e) {
        console.error(e) 
        return response.status(401).json("Não autenticado")
    }
} 