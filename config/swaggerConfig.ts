import { describe } from "node:test"

const initialRoute = {
                get:{
                summary: "Rota inicial / Healthcheck",
                responses: {
                    200:{
                        description: "Sucesso",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties:{
                                        sucess:{
                                            type: "boolean",
                                        }
                                    },
                                    example:{
                                        sucess: "true",
                                    }
                                }
                            }
                        }
                    }
                }
            }
}

const clientesRoutes = {
    get: {
        summary: "Lista de clientes",
        responses: {
            200:{
                description: "Lista recebida",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
                               $ref: "#/components/schemas/Clientes"
                            }
                        }
                    },
                    example: [
                        {
                            id: 1,
                            nome: "anthony",
                            idade: 17,
                            cpf: 3217382123211,
                            //properties
                            contas: [{
                                id: 1, 
                                //properties
                            }]

                        }
                    ]
                }
            }
        }
    },
    post:{
        tags: ["Clientes"],
        summary: "Criar Cliente",
        requestBody:{
            required:true,
            content: {
                "application/json": {
                    schema:{
                        type: "object",
                        properties:{
                            nome:{type: "string"},
                            //properties....
                        },
                    },
                    example:{
                        nome: "anthony",
                        //properties...
                    }
                }
            }
        },
        responses: {
            201:{
                description: "Cliente Criado",
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/Clientes"
                        }
                    }
                }
            }
        }
    }
}

const clientesSchema ={
    schema: {
                  
                                type: "object",
                                properties: {
                                    id: {
                                        type: "integer"
                                    },
                                    nome: {
                                        type: "string"
                                    },
                                    createdAt: {
                                        type: "string",
                                        format: "date"
                                    },
                                    contas:{
                                        type: "array",
                                        items:{
                                            type: "object",
                                            properties: {
                                                id: {type: "integer"},
                                                nome: {type: "string"}
                                                //propriedades do curso....

                                            }
                                        }
                                    }
                                }
                            }
                        
}

export default{
    clientesSchema,
    initialRoute,
    clientesRoutes
}