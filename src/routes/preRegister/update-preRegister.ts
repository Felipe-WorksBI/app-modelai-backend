import type { FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z, ZodError } from "zod";
import { preRegister } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq, sql } from "drizzle-orm";


export const updatePreRegister: FastifyPluginAsyncZod = async (server) =>{
    server.put('/pre-register/:regId', {
        preHandler:[
            checkRequestJWT,
            checkUserRole('admin')
        ],
        schema:{
            tags: ['pre-register'],
            summary: 'Atualizar pré-cadastro de empreendimento',
            params: z.object({
                regId: z.coerce.string(),
            }),
            body: z.object({
                name: z.string().min(2),
                appliedCompany: z.array(
                    z.string().min(2)
                ),
                typologies: z.array(
                    z.object({
                        type: z.string().min(2),
                        areaM2: z.number().min(1),
                        quantity: z.number().min(1)
                    })
                )
            }),
            response:{
                200: z.object({
                    message: z.string()
                }).describe('Pré-cadastro de empreendimento atualizado com sucesso!'),
                400: z.object({ 
                    message: z.string(),
                    details: z.any().optional()
                }).describe('Erro ao criar o pré-cadastro de empreendimento')
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
            return reply.status(400).send({ message: 'Erro ao atualizar o pré-cadastro de empeendimentos por: Sessão inválida!' });
        }
        const { regId } = request.params

        const updateItem = request.body
        if(!regId){
            return reply.status(400).send({ message: 'Erro ao atualizar o pré-cadastro de empreendimento: id não informado!' });
        }

        const result = await db
            .update(preRegister)
            .set({
                ...updateItem,
                updatedBy: user.sub,
                updatedAt: sql`now()`
            })
            .where(
                eq( preRegister.regId, Number( regId ) )
            )

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao atualizar o pré-cadastro de empreendimento' });
        }

        return reply.status(200).send({ message: 'Pré-cadastro de empreendimento atualizado com sucesso!' });
    })
}