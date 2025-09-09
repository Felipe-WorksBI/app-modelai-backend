import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { properties } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { eq } from "drizzle-orm";

//Criar um novo empreendimento
export const deletePropertyById: FastifyPluginAsyncZod = async (server) => {
    server.delete('/scenarios/properties/:empId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-properties'],
            summary: 'Criar um novo empreendimento para o cenário selecionado',
            params: z.object({
                empId: z.uuid()
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
        const { empId } = request.params;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao deletar o empreendimento' });
        }
        if(!empId){
            return reply.status(400).send({ message: 'Inputs para deletar o empreendimento não foi informado!' });
        }
        // Implement login logic here
        const result = await db
            .delete(properties)
            .where(eq( properties.empId, empId) )

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao deletar o empreendimento' });
        }

        return reply.status(200).send({ message: 'Empreendimento deletado com sucesso' });
    });

};