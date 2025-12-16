import type { FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z, ZodError } from "zod";
import { companies } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq, sql } from "drizzle-orm";


export const updateCompany: FastifyPluginAsyncZod = async (server) =>{
    server.put('/companies/:companyId', {
        preHandler:[
            checkRequestJWT,
            checkUserRole('admin')
        ],
        schema:{
            tags: ['companies'],
            summary: 'Atualizar empresa',
            params: z.object({
                companyId: z.uuid(),
            }),
            body: z.object({
                companyName: z.string().min(2),
                status: z.string()
            }),
            response:{
                200: z.object({
                    message: z.string()
                }).describe('Empresa atualizada com sucesso!'),
                400: z.object({ 
                    message: z.string(),
                    details: z.any().optional()
                }).describe('Erro ao atualizar a empresa')
            },
        },
        errorHandler(error, request, reply) {
            console.error('Error creating pre-register:', error);
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
            return reply.status(400).send({ message: 'Erro ao atualizar empresa: Sessão inválida!' });
        }
        const { companyId } = request.params

        const updateItem = request.body
        if(!companyId){
            return reply.status(400).send({ message: 'Erro ao atualizar a empresa: id não informado!' });
        }

        const result = await db
            .update(companies)
            .set({
                ...updateItem,
                updatedBy: user.sub,
                updatedAt: sql`now()`
            })
            .where(
                eq( companies.companyId, companyId )
            )

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao atualizar a empresa' });
        }

        return reply.status(200).send({ message: 'Empresa atualizada com sucesso!' });
    })
}