import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../../database/client.js';
import { z } from 'zod';
import { realEstateDetails } from "../../models/schema.js";
import { checkRequestJWT } from "./../hooks/check-request-jwt.js";
import { and, eq, sql } from "drizzle-orm";

//Criar um novo empreendimento
export const editRealEstateById: FastifyPluginAsyncZod = async (server) => {
    server.put('/scenarios/real-estate/:id', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-real-estate'],
            summary: 'Editar real estate',
            params: z.object({
                id: z.uuid()
            }),
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
                }).describe('Real estate editado com sucesso!'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const { prjId, empId } = request.body;
        const { id } = request.params;
        const editItem = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao deletar o real estate' });
        }
        if(!prjId || !empId){
            return reply.status(400).send({ message: 'Inputs para edição do real estate não foram informados!' });
        }
        if(!id){
            return reply.status(400).send({ message: 'ID do real estate não informado' });
        }
        // Implement login logic here
        const result = await db
            .update(realEstateDetails)
            .set({
                ...editItem,
                updatedBy: user.sub,
                updatedAt: sql`now()`
            })
            .where( 
                and( 
                    eq( realEstateDetails.realEstateId, id ),
                    eq( realEstateDetails.prjId, editItem.prjId ),
                    eq( realEstateDetails.empId, editItem.empId)
                )
            )
            .returning()

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao editar o real estate' });
        }

        return reply.status(200).send({ message: 'Real estate editado com sucesso!' });
    });

};