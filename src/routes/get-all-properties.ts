import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { eq } from "drizzle-orm";

//Criar um novo empreendimento
export const getProperty: FastifyPluginAsyncZod = async (server) => {
    server.get('/scenarios/properties/:prjId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-properties'],
            summary: 'Retornar os empreendimentos para o cenário selecionado',
            params:z.object({
                prjId: z.uuid()
            }),
            response:{
                200:z.object({
                    data: z.array(z.object({
                        empId: z.uuid(),
                        prjId: z.uuid(),
                        empName: z.string(),
                        createdAt: z.date(),
                        createdBy: z.uuid(),
                    })),
                    total: z.number()
                }).describe('Properties retrived successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const params = request.params
        const prjId = params.prjId;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao buscar as propriedades do cenário' });
        }
        if(!prjId){
            return reply.status(400).send({ message: 'ID do cenário não foi informado!' });
        }
        // Implement login logic here
        try{
            const result = await db
                .select()
                .from(properties)
                .where(eq(properties.prjId, prjId))
            
            const total = result.length ===0 ? 0 : result.length;

            return reply.status(200).send({ data: result, total });

        }catch (error : any) {
            // throw error
            console.log(error)
            return reply.status(400).send({ message: error || 'Erro ao buscar as propriedades do cenário' });
        }
    });

};