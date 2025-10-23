import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../../database/client.js';
import { z } from 'zod';
import { realEstateDetails,realEstatePayments } from "../../models/schema.js";
import { checkRequestJWT } from "./../hooks/check-request-jwt.js";
import { eq } from "drizzle-orm";

//Criar um novo empreendimento
export const getRealEstatePayments: FastifyPluginAsyncZod = async (server) => {
    server.get('/scenarios/real-estate/payments/:prjId', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['real-estate-payments'],
            summary: 'Buscar todos os pagamentos de real estate para o cenário selecionado',
            params: z.object({
                prjId: z.uuid()
            }),
            response:{
                200:z.object({
                    data: z.array(z.object({
                        paymentId: z.number(),
                        prjId: z.uuid(),
                        empId: z.uuid(),
                        nomeRealEstate: z.string(),
                        tipoRealEstate: z.string(),
                        dataVencimento: z.string(),
                        tipoParcela: z.string(),
                        numeroParcela: z.number(),
                        valorParcela: z.number(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                    })),
                    total: z.number()
                }).describe('Pagamentos de real estate recuperados com sucesso'),
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
        
        const result = await db
            .select({
                paymentId: realEstatePayments.paymentId,
                prjId: realEstatePayments.prjId,
                empId: realEstatePayments.empId,
                nomeRealEstate: realEstatePayments.nomeRealEstate,
                tipoRealEstate: realEstatePayments.tipoRealEstate,
                dataVencimento: realEstatePayments.dataVencimento,
                tipoParcela: realEstatePayments.tipoParcela,
                numeroParcela: realEstatePayments.numeroParcela,
                valorParcela: realEstatePayments.valorParcela,
                createdAt: realEstatePayments.createdAt,
                updatedAt: realEstatePayments.updatedAt,
            })
            .from(realEstatePayments)
            .where(eq( realEstatePayments.prjId, prjId ))
            // .leftJoin( realEstatePayments, eq( realEstatePayments.realEstateId, realEstateDetails.realEstateId ) )

        if (result.length === 0 || result[0].prjId === null) {
            return reply.status(400).send({ message: 'Erro ao buscar os pagamentos de real estate' });
        }

        const total = result.length ===0 ? 0 : result.length;


        return reply.status(200).send({ data: result, total });
    });

};