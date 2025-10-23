import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../../database/client.js';
import { z } from 'zod';
import { realEstateDetails } from "../../models/schema.js";
import { checkRequestJWT } from "./../hooks/check-request-jwt.js";
import { and, eq, sql } from "drizzle-orm";

//Criar um novo empreendimento
export const deleteRealEstateById: FastifyPluginAsyncZod = async (server) => {
    server.delete('/scenarios/real-estate/:id', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-real-estate'],
            summary: 'Deletar real estate',
            params: z.object({
                id: z.uuid()
            }),
            response:{
                200:z.object({
                    message: z.string()
                }).describe('Real estate deletado com sucesso!'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { id } = request.params;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao deletar o real estate' });
        }
        if(!id){
            return reply.status(400).send({ message: 'ID do real estate não informado' });
        }
        // Implement login logic here
        const result = await db
            .delete(realEstateDetails)
            .where(
                and(
                    eq(realEstateDetails.realEstateId, id),
                )
            )
        
        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar o real estate' });
        }

        return reply.status(200).send({ message: 'Real estate deletado com sucesso!' });
    });

};