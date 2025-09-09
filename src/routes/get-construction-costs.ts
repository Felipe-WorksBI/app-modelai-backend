import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { projectExpenses, properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { eq } from "drizzle-orm";

//Criar um novo empreendimento
export const getConstructionCosts: FastifyPluginAsyncZod = async (server) => {
    server.get('/scenarios/costs/:prjId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-costs'],
            summary: 'Retornar o custo de obra para o cenário selecionado',
            params: z.object({
                prjId: z.uuid()
            }),
            response:{
                200:z.object({
                    data: z.array(z.object({
                        id:z.number(),
                        empId: z.uuid(),
                        prjId: z.uuid(),
                        dataInicioCusto: z.coerce.string(),
                        tempoObra: z.number(),
                        custoTotalProjetado: z.number(),
                        areaConstruidaTotal: z.number(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                        createdBy: z.uuid(),
                        updatedBy: z.uuid(),
                    })),
                    total: z.number()
                }).describe('Cost retrieved successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId } = request.params;

        if(!user){
            return reply.status(400).send({ message: 'Erro de autenticação ao buscar os dados do usuário' });
        }
        if(!prjId ){
            return reply.status(400).send({ message: 'Inputs para busca dos custos de obra não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .select()
            .from(projectExpenses)
            .where(eq(projectExpenses.prjId, prjId))
        const total = result.length ===0 ? 0 : result.length;
        // if(result.length === 0){
        //     return reply.status(400).send({ message: 'Erro ao buscar os custos de obra' });
        // }

        return reply.status(200).send({ data: result, total });
    });

};