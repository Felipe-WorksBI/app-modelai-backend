import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";

//Criar um novo empreendimento
export const createProperty: FastifyPluginAsyncZod = async (server) => {
    server.post('/scenarios/properties', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-properties'],
            summary: 'Criar um novo empreendimento para o cenário selecionado',
            body: z.object({
                prjId: z.uuid(),
                empName: z.string()
            }),
            response:{
                200:z.object({
                    data: z.object({
                        empId: z.uuid(),
                        prjId: z.uuid(),
                        empName: z.string(),
                        createdAt: z.date(),
                        createdBy: z.uuid(),
                    })
                }).describe('Scenario created successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId, empName } = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar o cenário' });
        }
        if(!prjId || !empName){
            return reply.status(400).send({ message: 'Inputs para criação dos empreendimentos não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .insert(properties)
            .values({
                prjId,
                empName,
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