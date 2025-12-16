import type { FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z, ZodError } from "zod";
import { propertyAcquisitions } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq, sql } from "drizzle-orm";


export const deleteAcquisition: FastifyPluginAsyncZod = async (server) =>{
    server.delete('/scenarios/acquisitions/:propertyId', {
        preHandler:[
            checkRequestJWT,
        ],
        schema:{
            tags: ['acquisitions'],
            summary: 'Deletar captação do empreendimento',
            params: z.object({
                propertyId: z.uuid() 
            }),
            response:{
                200: z.object({
                    message: z.string()
                }).describe('Captação do empreendimento atualizada com sucesso!'),
                400: z.object({ 
                    message: z.string(),
                    details: z.any().optional()
                }).describe('Erro ao atualizar a captação do empreendimento')
            },
        },
        errorHandler(error, request, reply) {
            console.error('Error deleting acquisition:', error);
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
            return reply.status(400).send({ message: 'Erro ao deletar a captação: Sessão inválida!' });
        }
        const { propertyId } = request.params
        if(!propertyId){
            return reply.status(400).send({ message: 'Parâmetro para deletar não enviado!' });
        }

        const result = await db
            .delete(propertyAcquisitions)
            .where(
                eq(propertyAcquisitions.propertyId, propertyId)
            )

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar a captação do empreendimento' });
        }

        return reply.status(200).send({ message: 'Captação do empreendimento deletada com sucesso!' });
    })
}