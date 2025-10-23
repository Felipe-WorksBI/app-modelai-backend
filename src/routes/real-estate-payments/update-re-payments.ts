import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../../database/client.js';
import { z } from 'zod';
import { realEstatePayments } from "../../models/schema.js";
import { checkRequestJWT } from "./../hooks/check-request-jwt.js";
import { and, eq, sql } from "drizzle-orm";

//Criar um novo empreendimento
export const editRealEstatePayment: FastifyPluginAsyncZod = async (server) => {
    server.put('/scenarios/real-estate/payments/:paymentId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['real-estate-payments'],
            summary: 'Editar Pagamentos de real estate',
            params:z.object({
                paymentId: z.coerce.string(),
            }),
            body: z.object({
                // realEstateId: z.uuid(),
                prjId: z.uuid(),
                empId: z.uuid(),
                nomeRealEstate: z.string(),
                tipoRealEstate: z.string(),
                dataVencimento: z.string(),
                tipoParcela: z.string(),
                numeroParcela: z.number(),
                valorParcela: z.number()
            }),
            response:{
                200:z.object({
                    message: z.string()
                }).describe('Parcela editada com sucesso!'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId, empId } = request.body;
        const { paymentId } = request.params
        const editItem = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao editar o real estate' });
        }
        if(!paymentId){
            return reply.status(400).send({ message: 'Erro ao editar o real estate' });
        }
        if(!prjId || !empId){
            return reply.status(400).send({ message: 'Inputs para edição do real estate não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .update(realEstatePayments)
            .set({
                ...editItem,
                updatedBy: user.sub,
                updatedAt: sql`now()`
            })
            .where(
                and(
                    eq( realEstatePayments.paymentId, Number( paymentId ) ),
                    eq(realEstatePayments.prjId, prjId),
                    eq(realEstatePayments.empId, empId)
                )
            )
            .returning();

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao editar o pagamento' });
        }

        return reply.status(200).send({ message: 'Parcela editada com sucesso!' });
    });

};