import type { FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z, ZodError } from "zod";
import { propertyAcquisitions } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq } from "drizzle-orm";


export const createAcquisition: FastifyPluginAsyncZod = async (server) =>{
    server.post('/scenarios/acquisitions', {
        preHandler:[
            checkRequestJWT,
        ],
        schema:{
            tags: ['acquisitions'],
            summary: 'Criar captação do empreendimento',
            body: z.object({
                prjId: z.uuid(),
                empId: z.uuid(),
                nomeEmpresa: z.string(),
                dataCaptacao: z.string(),
                dataInicioPagamento: z.string(),
                valorCaptacao: z.number(),
                qtdParcelas: z.number(),
                jurosAno: z.number(),
            }),
            response:{
                200: z.object({
                    message: z.string()
                }).describe('Captação do empreendimento criada com sucesso!'),
                400: z.object({ 
                    message: z.string(),
                    details: z.any().optional()
                }).describe('Erro ao criar a captação do empreendimento')
            },
        },
        errorHandler(error, request, reply) {
            console.error('Error creating acquisition:', error);
            if (error instanceof ZodError) {
                return reply.status(400).send({
                    message: "Erro no body enviado.",
                    details: z.treeifyError(error), // ✅ Método recomendado,
                });
            }
            // return reply.status(400).send({ message: 'Erro ao criar o pré-cadastro de empreendimento' });
        },
    }, async (request, reply)=>{
        const user = request.user
        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar a captação: Sessão inválida!' });
        }
        const newItem = request.body
        
        // Verifica se já existe um pré-cadastro com o mesmo nome
        const existing = await db
            .select()
            .from(propertyAcquisitions)
            .where(eq( propertyAcquisitions.nomeEmpresa, newItem.nomeEmpresa ))

        if( existing.length > 0 ) {
            return reply
                .status(400)
                .send({
                    message: `Já existe uma captação com o nome '${newItem.nomeEmpresa}'`
                })
        }

        const result = await db
            .insert(propertyAcquisitions)
            .values({
                ...newItem,
                createdBy: user.sub,
                updatedBy: user.sub,
            })
            .returning();

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao criar a captação do empreendimento' });
        }

        return reply.status(200).send({ message: 'Captação do empreendimento criada com sucesso!' });
    })
}