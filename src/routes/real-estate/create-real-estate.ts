import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../../database/client.js';
import { z } from 'zod';
import { realEstateDetails } from "../../models/schema.js";
import { checkRequestJWT } from "./../hooks/check-request-jwt.js";

//Criar um novo empreendimento
export const createRealEstate: FastifyPluginAsyncZod = async (server) => {
    server.post('/scenarios/real-estate', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-real-estate'],
            summary: 'Criar real estate',
            body: z.object({
                prjId: z.uuid(),
                empId: z.uuid(),
                dataCompra: z.string(),
                valor: z.number(),
                tipoValor: z.enum(['entrada', 'licença', 'parcela','escritura']),
                tipoRealEstate: z.enum(['Terreno', 'Registro e Incorporação', 'Outros']),
            }),
            response:{
                200:z.object({
                    message: z.string()
                }).describe('Real estate criado com sucesso!'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId, empId } = request.body;
        const newItem = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar o real estate' });
        }
        if(!prjId || !empId){
            return reply.status(400).send({ message: 'Inputs para criação do real estate não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .insert(realEstateDetails)
            .values({
                ...newItem,
                createdBy: user.sub,
                updatedBy: user.sub,
            })
            .returning();

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao criar a despesa administrativa' });
        }

        return reply.status(200).send({ message: 'Real estate criado com sucesso!' });
    });

};