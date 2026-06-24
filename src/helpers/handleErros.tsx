import { Response } from "express";
import { Prisma } from "../../generated/prisma/client"
import PrismaErrorCodes from "../../config/prismaErrorCodes.json"

export function handleErrors(e: any, response: Response){
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        //@ts-ignore
        return response.status(PrismaErrorCodes[e.code] || 500).json(e.message)
    }
    return response.status(500).json("Unknown Error. Try again later")
}