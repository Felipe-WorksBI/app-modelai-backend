import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { administrativeExpenses, projectExpenses, properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { and, eq, sql } from "drizzle-orm";

//Criar um novo empreendimento
export const deleteAdmExpensesById: FastifyPluginAsyncZod = async (server) => {
    server.delete('/scenarios/expenses/:id', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-adm-expenses'],
            summary: 'Deletar a despesa administrativa para o cenário selecionado',
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
            return reply.status(400).send({ message: 'Erro ao criar a despesa administrativa' });
        }
        if(!id){
            return reply.status(400).send({ message: 'Custo administrativo não encontrado' });
        }
        // Implement login logic here
        const result = await db
            .delete(administrativeExpenses)
            .where(eq( administrativeExpenses.id, Number( id )))

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar a despesa administrativa' });
        }

        return reply.status(200).send({ message: 'Despesa administrativa deletada com sucesso' });
    });

};