import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../../database/client.js';
import { z } from 'zod';
import { realEstatePayments } from "../../models/schema.js";
import { checkRequestJWT } from "./../hooks/check-request-jwt.js";
import { and, eq, sql } from "drizzle-orm";

//Criar um novo empreendimento
export const deleteRealEstatePaymentById: FastifyPluginAsyncZod = async (server) => {
    server.delete('/scenarios/real-estate/payments/:paymentId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['real-estate-payments'],
            summary: 'Deletar o pagamento real estate',
            params: z.object({
                paymentId: z.coerce.string()
            }),
            response:{
                200:z.object({
                    message: z.string()
                }).describe('Pagamento do Real estate deletado com sucesso!'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { paymentId } = request.params;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao deletar o pagamento' });
        }
        if(!paymentId){
            return reply.status(400).send({ message: 'ID do real estate não informado' });
        }
        // Implement login logic here
        const result = await db
            .delete(realEstatePayments)
            .where(
                and(
                    eq(realEstatePayments.paymentId, Number( paymentId )),
                )
            )
        
        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar o pagamento' });
        }

        return reply.status(200).send({ message: 'Pagamento deletado com sucesso!' });
    });

};