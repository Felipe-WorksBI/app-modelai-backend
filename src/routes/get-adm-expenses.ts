import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.ts';
import { z } from 'zod';
import { administrativeExpenses,  } from "../models/schema.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { eq } from "drizzle-orm";

//Criar um novo empreendimento
export const getAdmExpensesByScenario: FastifyPluginAsyncZod = async (server) => {
    server.get('/scenarios/expenses/:prjId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-adm-expenses'],
            summary: 'Criar a despesa administrativa para o cenário selecionado',
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
                        mesesAtivo: z.number(),
                        tipoDespesa: z.coerce.string(),
                        baseCalculo: z.coerce.string(),
                        pctValor: z.number(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                        createdBy: z.uuid(),
                        updatedBy: z.uuid(),
                    })),
                    total: z.number()
                }).describe('Adm expenses retrieved successfully'),
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
            return reply.status(400).send({ message: 'Inputs para busca das despesas administrativas não foram informado!' });
        }
        // Implement login logic here
        const result = await db
            .select()
            .from(administrativeExpenses)
            .where(eq(administrativeExpenses.prjId, prjId))
        const total = result.length ===0 ? 0 : result.length;

        // if(result.length === 0){
        //     return reply.status(400).send({ message: 'Erro ao buscar as despesas administrativas' });
        // }

        return reply.status(200).send({ data: result, total });
    });

};