import type { FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z, ZodError } from "zod";
import { companies, preRegister } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq, sql } from "drizzle-orm";
import { groupByProject } from "../../utils/utils.js";

export const readPreRegister: FastifyPluginAsyncZod = async (server) =>{
    server.get('/pre-register', {
        preHandler:[
            checkRequestJWT,
        ],
        schema:{
            tags: ['pre-register'],
            summary: 'Listar pré-cadastro de empreendimento',
            // querystring:z.object({
            //     companyId: z.uuid().optional()
            // }),
            response:{
                200: z.object({
                    data: z.array(z.object({
                        regId: z.number(),
                        name: z.string(),
                        appliedCompany: z.array(z.string()),
                        typologies: z.array(
                            z.object({
                                type: z.string(),
                                areaM2: z.number(),
                                quantity: z.number()
                            })
                        ),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                        createdBy: z.uuid(),
                        updatedBy: z.uuid(),
                        companies: z.array( z.object({
                            companyId: z.uuid(),
                            companyName: z.string(),
                            status:z.string(),
                        })),
                    })),
                    total: z.number()
                }).describe('Empreendimentos pré-cadastrados recuperados com sucesso!'),
                400: z.object({
                    message: z.string(),
                })
            }
        }
    }, async (request, reply)=>{
        const user = request.user
        if(!user){
            return reply.status(400).send({ message: 'Erro ao buscar o pré-cadastro de empreendimentos por: Sessão inválida!' });
        }

        if(!user.companyId){
            return reply.status(400).send({ message: 'Erro ao buscar o pré-cadastro de empreendimentos por: Empresa do usuário não encontrada!' });
        }

        let rows
        // Se o usuário logado for admin não filtra por companyId
        if (user.role === 'admin'){
            rows = await db
                .select({
                    regId: preRegister.regId,
                    name: preRegister.name,
                    appliedCompany: preRegister.appliedCompany,
                    typologies: preRegister.typologies,
                    createdAt: preRegister.createdAt,
                    updatedAt: preRegister.updatedAt,
                    createdBy: preRegister.createdBy,
                    updatedBy: preRegister.updatedBy,
                    company: {
                        companyId: companies.companyId,
                        companyName: companies.companyName,
                        status: companies.status,
                    },
                })
                .from(preRegister)
                .leftJoin(
                    sql`LATERAL jsonb_array_elements_text(${preRegister.appliedCompany}) AS applied(id)`,
                    sql`TRUE`
                )
                .leftJoin(
                    companies,
                    sql`
                    (${preRegister.appliedCompany} @> '["all"]')
                    OR (
                        applied.id ~ '^[0-9a-fA-F-]{36}$'
                        AND applied.id::uuid = ${companies.companyId}
                    )
                    `
                )
        } else {
            // caso contrário, filtra pelo companyId do usuário logado
            const companyId = user.companyId;
            rows = await db
                .select({
                    regId: preRegister.regId,
                    name: preRegister.name,
                    appliedCompany: preRegister.appliedCompany,
                    typologies: preRegister.typologies,
                    createdAt: preRegister.createdAt,
                    updatedAt: preRegister.updatedAt,
                    createdBy: preRegister.createdBy,
                    updatedBy: preRegister.updatedBy,
                    company: {
                        companyId: companies.companyId,
                        companyName: companies.companyName,
                        status: companies.status,
                    },
                })
                .from(preRegister)
                .leftJoin(
                    sql`LATERAL jsonb_array_elements_text(${preRegister.appliedCompany}) AS applied(id)`,
                    sql`TRUE`
                )
                .leftJoin(
                    companies,
                    sql`
                    (${preRegister.appliedCompany} @> '["all"]')
                    OR (
                        applied.id ~ '^[0-9a-fA-F-]{36}$'
                        AND applied.id::uuid = ${companies.companyId}
                    )
                    `
                )
                .where(
                    sql`${companies.companyId} = ${companyId}`
                )
        }
        
        const result = groupByProject(rows)

        const total = result.length ===0 ? 0 : result.length;

        return reply.status(200).send({ data: result, total });

    })
}