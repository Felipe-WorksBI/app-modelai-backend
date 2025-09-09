import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.ts';
import { z } from 'zod';
import { administrativeExpenses, projectExpenses, properties } from "../models/schema.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";

//Criar um novo empreendimento
export const createAdmExpenses: FastifyPluginAsyncZod = async (server) => {
    server.post('/scenarios/expenses', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-adm-expenses'],
            summary: 'Criar a despesa administrativa para o cenário selecionado',
            body: z.object({
                prjId: z.uuid(),
                empId: z.uuid(),
                dataInicioCusto: z.string(),
                mesesAtivo:z.number(),
                tipoDespesa: z.enum(['Marketing', 'Comissão de vendas','Taxa de Gestão', 'Impostos']),
                baseCalculo: z.enum(['% do VGV', '% da Receita Líquida Prevista','% sobre Cada Venda', '% sobre Custo da Obra','% sobre Resultado']),
                pctValor: z.number()
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
            return reply.status(400).send({ message: 'Erro ao criar a despesa administrativa' });
        }
        if(!prjId || !empId){
            return reply.status(400).send({ message: 'Inputs para criação das despesas administrativas não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .insert(administrativeExpenses)
            .values({
                ...newCost,
                createdBy: user.sub,
                updatedBy: user.sub,
            })
            .returning()

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao criar a despesa administrativa' });
        }

        return reply.status(200).send({ data: result[0] });
    });

};