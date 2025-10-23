import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../../database/client.js';
import { z } from 'zod';
import { realEstateDetails } from "../../models/schema.js";
import { checkRequestJWT } from "./../hooks/check-request-jwt.js";
import { eq } from "drizzle-orm";

//Criar um novo empreendimento
export const getAllRealEstate: FastifyPluginAsyncZod = async (server) => {
    server.get('/scenarios/real-estate/:prjId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-real-estate'],
            summary: 'Buscar todos os empreendimentos para o cenário selecionado',
            params: z.object({
                prjId: z.uuid()
            }),
            response:{
                200:z.object({
                    data: z.array(z.object({
                        realEstateId: z.uuid(),
                        empId: z.uuid(),
                        prjId: z.uuid(),
                        dataCompra: z.string(),
                        tipoRealEstate: z.enum(['Terreno', 'Registro e Incorporação', 'Outros']),
                        valor: z.number(),
                        tipoValor: z.enum(['entrada', 'licença', 'parcela','escritura']),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                        createdBy: z.uuid(),
                        updatedBy: z.uuid(),
                    })),
                    total: z.number()
                }).describe('Real estate retrieved successfully'),
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
            return reply.status(400).send({ message: 'Inputs para busca do Real Estate não foram informado!' });
        }
        // Implement login logic here
        const result = await db
            .select()
            .from(realEstateDetails)
            .where(eq(realEstateDetails.prjId, prjId))
        const total = result.length ===0 ? 0 : result.length;

        // if(result.length === 0){
        //     return reply.status(400).send({ message: 'Erro ao buscar as despesas administrativas' });
        // }

        return reply.status(200).send({ data: result, total });
    });

};