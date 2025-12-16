import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z, ZodError } from "zod";
import { companies } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq } from "drizzle-orm";


export const deleteCompany: FastifyPluginAsyncZod = async (server) =>{
    server.delete('/companies/:companyId', {
        preHandler:[
            checkRequestJWT,
            checkUserRole('admin')
        ],
        schema:{
            tags: ['companies'],
            summary: 'Deletar empresa',
            params: z.object({
                companyId: z.uuid(),
            }),
            response:{
                200: z.object({
                    message: z.string()
                }).describe('Empresa deletada com sucesso!'),
                400: z.object({ 
                    message: z.string(),
                    details: z.any().optional()
                }).describe('Erro ao deletar a empresa')
            },
        },
        errorHandler(error, request, reply) {
            console.error('Error deleting company:', error);
            if (error instanceof ZodError) {
                return reply.status(400).send({
                    message: "Erro no body enviado.",
                    details: z.treeifyError(error), // ✅ Método recomendado,
                });
            }
            // return reply.status(400).send({ message: 'Erro ao criar o pré-cadastro de empreendimento' });
        },
    }, async (request, reply)=>{
        const user = request.user
        if(!user){
            return reply.status(400).send({ message: 'Erro ao deletar a empresa: Sessão inválida!' });
        }
        const { companyId } = request.params
        if(!companyId){
            return reply.status(400).send({ message: 'Erro ao deletar a empresa: id não informado!' });
        }

        const result = await db
            .delete(companies)
            .where(
                eq( companies.companyId, companyId )
            )

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar a empresa' });
        }

        return reply.status(200).send({ message: 'Empresa deletada com sucesso!' });
    })
}