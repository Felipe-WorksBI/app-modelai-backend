import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z } from "zod";
import { propertyAcquisitions } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { eq } from "drizzle-orm";

export const readAcquisitions: FastifyPluginAsyncZod = async (server) =>{
    server.get('/scenarios/:prjId/acquisitions', {
        preHandler:[
            checkRequestJWT,
        ],
        schema:{
            tags: ['acquisitions'],
            summary: 'Listar captações por cenário',
            params:z.object({
                prjId: z.uuid()
            }),
            response:{
                200: z.object({
                    data: z.array(z.object({
                        propertyId: z.uuid(),
                        prjId: z.uuid(),
                        empId: z.uuid(),
                        nomeEmpresa: z.string(),
                        dataCaptacao: z.string(),
                        dataInicioPagamento: z.string(),
                        valorCaptacao: z.number(),
                        qtdParcelas: z.number(),
                        jurosAno: z.number(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                        createdBy: z.uuid(),
                        updatedBy: z.uuid(),
                    })),
                    total: z.number()
                }).describe('Captações listadas com sucesso!'),
                400: z.object({
                    message: z.string(),
                })
            }
        }
    }, async (request, reply)=>{
        const user = request.user
        const { prjId } = request.params
        if(!user){
            return reply.status(400).send({ message: 'Erro ao buscar a captação: Sessão inválida!' });
        }
        if(!user.companyId){
            return reply.status(400).send({ message: 'Erro ao buscar a captação: Empresa do usuário não encontrada!' });
        }
        if(!prjId){
            return reply.status(400).send({ message: 'Parâmetro de busca não enviado!' });
        }

        const result = await db
                .select()
                .from(propertyAcquisitions)
                .where(
                    eq(
                        propertyAcquisitions.prjId, prjId
                    )
                )

        const total = result.length ===0 ? 0 : result.length;

        return reply.status(200).send({ data: result, total });

    })
}