import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { projectExpenses, properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { and, eq, sql } from "drizzle-orm";

//Criar um novo empreendimento
export const editConstructionCostsById: FastifyPluginAsyncZod = async (server) => {
    server.put('/scenarios/costs/:id', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-costs'],
            summary: 'Editar o custo de obra para o cenário selecionado',
            params: z.object({
                id: z.coerce.string()
            }),
            body: z.object({
                prjId: z.uuid(),
                empId: z.uuid(),
                dataInicioCusto: z.string(),
                tempoObra: z.number(),
                custoTotalProjetado: z.number(),
                areaConstruidaTotal: z.number()
            }),
            response:{
                200:z.object({
                    message: z.string()
                }).describe('Cost created successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId, empId } = request.body;
        const editCost = request.body;

        const { id } = request.params;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar o custo de obra' });
        }
        if(!id){
            return reply.status(400).send({ message: 'Custo de obra não encontrado' });
        }
        if(!prjId || !empId){
            return reply.status(400).send({ message: 'Inputs para edição dos custos de obra não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .update(projectExpenses)
            .set({
                ...editCost,
                updatedBy: user.sub,
                updatedAt: sql`now()`
            })
            .where(and(eq( projectExpenses.id, Number( id ))))

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao editar o cenário' });
        }

        return reply.status(200).send({ message: 'Custo de obra editado com sucesso'  });
    });

};