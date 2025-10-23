import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../../database/client.js';
import { z } from 'zod';
import { realEstatePayments } from "../../models/schema.js";
import { checkRequestJWT } from "./../hooks/check-request-jwt.js";

//Criar um novo empreendimento
export const createRealEstatePayment: FastifyPluginAsyncZod = async (server) => {
    server.post('/scenarios/real-estate/payments', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['real-estate-payments'],
            summary: 'Criar Pagamentos de real estate',
            body: z.object({
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
                }).describe('Parcela criada com sucesso!'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId, empId } = request.body;
        const newItem = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar o real estate' });
        }
        if(!prjId || !empId){
            return reply.status(400).send({ message: 'Inputs para criação do real estate não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .insert(realEstatePayments)
            .values({
                ...newItem,
                createdBy: user.sub,
                updatedBy: user.sub,
            })
            .returning();

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao criar o pagamento' });
        }

        return reply.status(200).send({ message: 'Parcela criada com sucesso!' });
    });

};