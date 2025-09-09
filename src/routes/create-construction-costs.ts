import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.ts';
import { z } from 'zod';
import { projectExpenses, properties } from "../models/schema.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";

//Criar um novo empreendimento
export const createConstructionCosts: FastifyPluginAsyncZod = async (server) => {
    server.post('/scenarios/costs', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-costs'],
            summary: 'Criar o custo de obra para o cenário selecionado',
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
                    data: z.object({
                        id: z.number(),
                        createdAt: z.date(),
                        createdBy: z.uuid(),
                    })
                }).describe('Cost created successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId, empId } = request.body;
        const newCost = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar o custo de obra' });
        }
        if(!prjId || !empId){
            return reply.status(400).send({ message: 'Inputs para criação dos custos de obra não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .insert(projectExpenses)
            .values({
                ...newCost,
                createdBy: user.sub,
                updatedBy: user.sub,
            })
            .returning()

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao criar o cenário' });
        }

        return reply.status(200).send({ data: result[0] });
    });

};