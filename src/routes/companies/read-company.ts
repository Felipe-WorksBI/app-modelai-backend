import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z } from "zod";
import { companies } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq } from "drizzle-orm";

export const readCompany: FastifyPluginAsyncZod = async (server) =>{
    server.get('/companies', {
        preHandler:[
            checkRequestJWT,
            checkUserRole('admin')
        ],
        schema:{
            tags: ['companies'],
            summary: 'Listar empresas',
            querystring:z.object({
                companyId: z.uuid().optional()
            }),
            response:{
                200: z.object({
                    data: z.array(z.object({
                        companyId: z.uuid(),
                        companyName: z.string(),
                        status:z.string(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                    })),
                    total: z.number()
                }).describe('Empreendimentos pré-cadastrados recuperados com sucesso!'),
                400: z.object({
                    message: z.string(),
                })
            }
        },
        errorHandler(error, request, reply) {
            console.error('Error reading company:', error);
            return reply.status(400).send({ message: error.message || 'Erro ao buscar as empresas.' });
        },
    }, async (request, reply)=>{
        const user = request.user
        if(!user){
            return reply.status(400).send({ message: 'Erro ao buscar o pré-cadastro de empreendimentos por: Sessão inválida!' });
        }
        const { companyId } = request.query


        if(companyId){
            const result = await db
                .select()
                .from(companies)
                .where(
                    eq(companies.companyId, companyId)
                )
            const total = result.length ===0 ? 0 : result.length;

            return reply.status(200).send({ data: result, total });
        }

        const result = await db
            .select()
            .from(companies)

        const total = result.length ===0 ? 0 : result.length;

        return reply.status(200).send({ data: result, total });

    })
}