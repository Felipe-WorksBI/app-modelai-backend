import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { administrativeExpenses, projectExpenses, properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { and, eq, sql } from "drizzle-orm";

//Criar um novo empreendimento
export const editAdmExpenses: FastifyPluginAsyncZod = async (server) => {
    server.put('/scenarios/expenses/:id', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-adm-expenses'],
            summary: 'Criar a despesa administrativa para o cenário selecionado',
            params: z.object({
                id: z.coerce.string()
            }),
            body: z.object({
                prjId: z.uuid(),
                empId: z.uuid(),
                dataInicioCusto: z.string(),
                mesesAtivo:z.number(),
                tipoDespesa: z.enum(['Marketing', 'Comissão de vendas','Taxa de Gestão', 'Impostos']),
                baseCalculo: z.string(),
                pctValor: z.number()
            }),
            response:{
                200:z.object({
                    message: z.string()
                }).describe('Cost edited successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId, empId } = request.body;
        const editCost = request.body;
        const { id } = request.params;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar a despesa administrativa' });
        }
        if(!id){
            return reply.status(400).send({ message: 'Custo administrativo não encontrado' });
        }
        if(!prjId || !empId){
            return reply.status(400).send({ message: 'Inputs para edição das despesas administrativas não foram informados!' });
        }
        // Implement login logic here
        const result = await db
            .update(administrativeExpenses)
            .set({
                ...editCost,
                updatedBy: user.sub,
                updatedAt: sql`now()`
            })
            .where(and(eq( administrativeExpenses.id, Number( id )), eq( administrativeExpenses.tipoDespesa, editCost.tipoDespesa)) )

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao editar a despesa administrativa' });
        }

        return reply.status(200).send({ message: 'Despesa administrativa editada com sucesso' });
    });

};