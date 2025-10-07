import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { projectExpenses, properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { and, eq, sql } from "drizzle-orm";

//Criar um novo empreendimento
export const deleteConstructionCostsById: FastifyPluginAsyncZod = async (server) => {
    server.delete('/scenarios/costs/:id', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-costs'],
            summary: 'Deletar o custo de obra para o cenário selecionado',
            params: z.object({
                id: z.coerce.string()
            }),
            response:{
                200:z.object({
                    message: z.string()
                }).describe('Cost deleted successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;

        const { id } = request.params;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao deletar o custo de obra' });
        }
        if(!id){
            return reply.status(400).send({ message: 'Custo de obra não encontrado' });
        }
        // Implement login logic here
        const result = await db
            .delete(projectExpenses)
            .where(and(eq( projectExpenses.id, Number( id ))))

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar o cenário' });
        }

        return reply.status(200).send({ message: 'Custo de obra deletado com sucesso'  });
    });

};