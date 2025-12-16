import type { FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z, ZodError } from "zod";
import { preRegister } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq, sql } from "drizzle-orm";


export const deletePreRegister: FastifyPluginAsyncZod = async (server) =>{
    server.delete('/pre-register/:regId', {
        preHandler:[
            checkRequestJWT,
            checkUserRole('admin')
        ],
        schema:{
            tags: ['pre-register'],
            summary: 'Deletar pré-cadastro de empreendimento',
            params: z.object({
                regId: z.coerce.string(),
            }),
            response:{
                200: z.object({
                    message: z.string()
                }).describe('Pré-cadastro de empreendimento deletado com sucesso!'),
                400: z.object({ 
                    message: z.string(),
                    details: z.any().optional()
                }).describe('Erro ao deletar o pré-cadastro de empreendimento')
            },
        },
        errorHandler(error, request, reply) {
            console.error('Error deleting pre-register:', error);
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
            return reply.status(400).send({ message: 'Erro ao deletar o pré-cadastro de empeendimentos por: Sessão inválida!' });
        }
        const { regId } = request.params
        if(!regId){
            return reply.status(400).send({ message: 'Erro ao deletar o pré-cadastro de empreendimento: id não informado!' });
        }

        const result = await db
            .delete(preRegister)
            .where(
                eq( preRegister.regId, Number( regId ) )
            )

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar o pré-cadastro de empreendimento' });
        }

        return reply.status(200).send({ message: 'Pré-cadastro de empreendimento deletado com sucesso!' });
    })
}