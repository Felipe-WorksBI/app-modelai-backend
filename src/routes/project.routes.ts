import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.ts';
import { z } from 'zod';
import { projects } from "../models/schema.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { bodyScenario, responseScenario, responseScenarioArray } from "../types/input.types.ts";
import { eq, sql } from "drizzle-orm";


export const projectRoutes: FastifyPluginAsyncZod = async (server) => {
    server.post('/scenarios', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario'],
            summary: 'Create a new scenario',
            body: bodyScenario,
            response:{
                200:responseScenario.describe('Scenario created successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjName } = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar o cenário' });
        }
        if(!prjName){
            return reply.status(400).send({ message: 'Inputs para criação do cenário não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .insert(projects)
            .values({
                prjName,
                createdBy: user.sub,
                updatedBy: user.sub,
            })
            .returning()

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao criar o cenário' });
        }

        return reply.status(200).send({ data: result[0] });
    });
    server.get('/scenarios', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario'],
            summary: 'Get all scenarios',
            response:{
                200:responseScenarioArray.describe('Scenario retrieved successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        // Implement login logic here
        const result = await db
            .select({
                prjId: projects.prjId,
                prjName: projects.prjName,
                createdBy: projects.createdBy,
                updatedBy: projects.updatedBy,
                createdAt: projects.createdAt,
                updatedAt: projects.updatedAt,
            })
            .from(projects);
        
            
        // if(result.length === 0){
        //     return reply.status(400).send({ message: 'Erro ao criar o cenário' });
        // }
            const total = result.length ===0 ? 0 : result.length;
            
        return reply.status(200).send({ data: result, total });
    });
    server.put('/scenarios/:id', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario'],
            summary: 'Edit Scenario',
            params: z.object({
                id: z.uuid().describe('The ID of the scenario to edit')
            }),
            body: bodyScenario,
            response:{
                200:responseScenario.describe('Scenario edited successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const params = request.params
        const prjId = params.id;
        console.log(params);
        console.log(prjId)
        // const { prjId } = request.params;
        const { prjName } = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao editar o cenário' });
        }
        if(!prjId){
            return reply.status(400).send({ message: 'ID do cenário não foi informado!' });
        }
        if(!prjName){
            return reply.status(400).send({ message: 'Inputs para edição do cenário não foi informado!' });
        }
        // Implement login logic here
        try{
            const result = await db
                .update(projects)
                .set({
                    prjName,
                    updatedBy: user.sub,
                    updatedAt: sql`NOW()`,
                })
                .where(eq(projects.prjId, prjId))
                .returning()

            if(result.length === 0){
                return reply.status(400).send({ message: 'Erro ao editar o cenário' });
            }
            return reply.status(200).send({ data: result[0] });
        }catch (error : any) {
            // throw error
            console.log(error)
            return reply.status(400).send({ message: error || 'Erro ao editar o cenário' });
        }
    });
};