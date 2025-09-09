import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { projects, properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { eq } from "drizzle-orm";

//Criar um novo empreendimento
export const deleteScenarioById: FastifyPluginAsyncZod = async (server) => {
    server.delete('/scenarios/:prjId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario'],
            summary: 'Deletar o empreendimento para o cenário selecionado',
            params: z.object({
                prjId: z.uuid()
            }),
            response:{
                200:z.object({
                    message: z.string()
                }).describe('Property deleted successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId } = request.params;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao deletar o Cenário' });
        }
        if(!prjId){
            return reply.status(400).send({ message: 'Inputs para deletar o Cenário não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .delete(projects)
            .where(eq( projects.prjId, prjId) )

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar o Cenário' });
        }

        return reply.status(200).send({ message: 'Cenário deletado com sucesso' });
    });

};