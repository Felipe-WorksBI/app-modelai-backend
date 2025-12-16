import type { FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { db } from "../../database/client.js";
import { z, ZodError } from "zod";
import { companies } from "../../models/schema.js";
import { checkRequestJWT } from "../hooks/check-request-jwt.js";
import { checkUserRole } from "../hooks/check-user-role.js";
import { eq } from "drizzle-orm";


export const createCompany: FastifyPluginAsyncZod = async (server) =>{
    server.post('/companies', {
        preHandler:[
            checkRequestJWT,
            checkUserRole('admin')
        ],
        schema:{
            tags: ['companies'],
            summary: 'Criar empresa',
            body: z.object({
                companyName: z.string().min(2),
                status: z.string()
            }),
            response:{
                200: z.object({
                    message: z.string()
                }).describe('Empresa criada com sucesso!'),
                400: z.object({ 
                    message: z.string(),
                    details: z.any().optional()
                }).describe('Erro ao criar a empresa')
            },
        },
        errorHandler(error, request, reply) {
            console.error('Error creating company:', error);
            if (error instanceof ZodError) {
                return reply.status(400).send({
                    message: "Erro no body enviado.",
                    details: z.treeifyError(error), // ✅ Método recomendado,
                });
            }
        },
    }, async (request, reply)=>{
        const user = request.user
        if(!user){
            return reply.status(400).send({ message: 'Erro ao criar o pré-cadastro de empeendimentos por: Sessão inválida!' });
        }
        const newItem = request.body
        
        // Verifica se já existe um pré-cadastro com o mesmo nome
        const existing = await db
            .select()
            .from(companies)
            .where(eq( companies.companyName, newItem.companyName ))

        if( existing.length > 0 ) {
            return reply
                .status(400)
                .send({
                    message: `Já existe uma empresa com o nome '${newItem.companyName}' cadastrada.`,
                })
        }

        const result = await db
            .insert(companies)
            .values({
                ...newItem,
                createdBy: user.sub,
                updatedBy: user.sub,
            })
            .returning();

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao criar a empresa' });
        }

        return reply.status(200).send({ message: 'Empresa criada com sucesso!' });
    })
}