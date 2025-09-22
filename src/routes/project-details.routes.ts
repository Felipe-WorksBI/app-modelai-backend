import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { projectDetails } from "../models/schema.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { eq, sql } from "drizzle-orm";



export const prjDetailsRoutes: FastifyPluginAsyncZod = async (server) => {
    server.get('/scenarios/details/:prjId',{
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-details'],
            summary: 'Get Scenario details of the selected scenario',
            description:'Retornar todos os dados da fase correspondente ao id selecionado',
            params: z.object({
                prjId: z.uuid().describe('The ID of the scenario')
            }),
            response:{
                200: z.object({
                    data: z.array(z.object({
                        id: z.number(),
                        prjId: z.uuid(),
                        empId: z.uuid(),
                        prjFase: z.string(),
                        areaVendida: z.number(),
                        areaPermuta: z.number(),
                        valorM2: z.number(),
                        dataInicio: z.string(),
                        prazoVendas: z.number(),
                        pctValorizacao: z.number(),
                        pctUnidadesVista: z.number(),
                        pctEntrada: z.number(),
                        qtdParcelas: z.number(),
                        pctReforco: z.number(),
                        qtdBaloes: z.number(),
                        periodicidadeReforco: z.string(),
                        pctJuros: z.number(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                        createdBy: z.uuid(),
                        updatedBy: z.uuid(),
                    })),
                    total: z.number()
            }).describe('Retrive Scenario details successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const params = request.params
        const prjId = params.prjId;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao editar os detalhes do cenário' });
        }
        if(!prjId){
            return reply.status(400).send({ message: 'ID dos detalhes do cenário não foi informado!' });
        }
        // Implement login logic here
        try{
            const result = await db
                .select()
                .from(projectDetails)
                .where(eq(projectDetails.prjId, prjId))
            
            const total = result.length ===0 ? 0 : result.length;

            return reply.status(200).send({ data: result, total });

        }catch (error : any) {
            // throw error
            console.log(error)
            return reply.status(400).send({ message: error || 'Erro ao buscar os detalhes do cenário' });
        }
    });
    // Create Scenario details
    server.post('/scenarios/details', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario-details'],
            summary: 'Create scenario details per ID',
            // params: z.object({
            //     id: z.uuid().describe('The ID of the scenario to edit')
            // }),
            body: z.object({
                prjId: z.uuid(),
                empId: z.uuid(),
                prjFase: z.string(),
                areaVendida: z.number(),
                areaPermuta: z.number(),
                valorM2: z.number(),
                dataInicio: z.string(),
                prazoVendas: z.number(),
                pctValorizacao: z.number(),
                pctUnidadesVista: z.number(),
                pctEntrada: z.number(),
                qtdParcelas: z.number(),
                pctReforco: z.number(),
                qtdBaloes: z.number(),
                // periodicidadeReforco: z.enum(['trimestral', 'semestral', 'anual']),
                pctJuros: z.number(),
            }),
            response:{
                200: z.object({
                    data: z.object({
                        id: z.number(),
                        prjId: z.uuid(),
                        empId: z.uuid(),
                        prjFase: z.string(),
                        areaVendida: z.number(),
                        areaPermuta: z.number(),
                        valorM2: z.number(),
                        dataInicio: z.coerce.string(),
                        prazoVendas: z.number(),
                        pctValorizacao: z.number(),
                        pctUnidadesVista: z.number(),
                        pctEntrada: z.number(),
                        qtdParcelas: z.number(),
                        pctReforco: z.number(),
                        qtdBaloes: z.number(),
                        periodicidadeReforco: z.string(),
                        pctJuros: z.number(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                        createdBy: z.uuid(),
                        updatedBy: z.uuid(),
                    })
            }).describe('Scenario created successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const prjDetails = request.body;
        if(!user){
            return reply.status(400).send()
        }
        // type key = keyof typeof projectDetails.createdAt;
        const result = await db
            .insert(projectDetails)
            .values({
                ...prjDetails,
                // prjId: prjDetails.prjId,
                // prjFase: prjDetails.prjFase,
                // areaVendida: prjDetails.areaVendida,
                // areaPermuta: prjDetails.areaPermuta,
                // valorM2: prjDetails.valorM2,
                // dataInicio: prjDetails.dataInicio,
                // prazoVendas: prjDetails.prazoVendas,
                // pctValorizacao: prjDetails.pctValorizacao,
                // pctUnidadesVista: prjDetails.pctUnidadesVista,
                // pctEntrada: prjDetails.pctEntrada,
                // qtdParcelas: prjDetails.qtdParcelas,
                // pctReforco: prjDetails.pctReforco,
                // qtdBaloes: prjDetails.qtdBaloes,
                // periodicidadeReforco: prjDetails.periodicidadeReforco,
                // pctJuros: prjDetails.pctJuros,
                createdBy: user.sub,
                updatedBy: user.sub,
            })
            .returning()

        if(result.length === 0){
            return reply.status(400).send({ message: 'Erro ao criar os detalhes do cenário' });
        }

        return reply.status(200).send({data: result[0]});
    });
    // Edit Scenario Details
    server.put('/scenarios/details/:id', {
        preHandler:[
            checkRequestJWT
        ],
        schema: {
            tags: ['scenario'],
            summary: 'Edit Scenario',
            params: z.object({
                id: z.coerce.string().describe('The ID of the scenario to edit')
            }),
            body: z.object({
                prjFase: z.string(),
                areaVendida: z.number(),
                areaPermuta: z.number(),
                valorM2: z.number(),
                dataInicio: z.string(),
                prazoVendas: z.number(),
                pctValorizacao: z.number(),
                pctUnidadesVista: z.number(),
                pctEntrada: z.number(),
                qtdParcelas: z.number(),
                pctReforco: z.number(),
                qtdBaloes: z.number(),
                // periodicidadeReforco: z.enum(['trimestral', 'semestral', 'anual']),
                pctJuros: z.number(),
            }),
            response:{
                200: z.object({
                    data: z.object({
                        id: z.number(),
                        prjId: z.uuid(),
                        prjFase: z.string(),
                        areaVendida: z.number(),
                        areaPermuta: z.number(),
                        valorM2: z.number(),
                        dataInicio: z.string(),
                        prazoVendas: z.number(),
                        pctValorizacao: z.number(),
                        pctUnidadesVista: z.number(),
                        pctEntrada: z.number(),
                        qtdParcelas: z.number(),
                        pctReforco: z.number(),
                        qtdBaloes: z.number(),
                        periodicidadeReforco: z.string(),
                        pctJuros: z.number(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                        createdBy: z.uuid(),
                        updatedBy: z.uuid(),
                    })
            }).describe('Scenario created successfully'),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        const params = request.params
        const id = params.id;
        // const { prjId } = request.params;
        const newValues = request.body;

        if(!user){
            return reply.status(400).send({ message: 'Erro ao editar os detalhes do cenário' });
        }
        if(!id){
            return reply.status(400).send({ message: 'ID dos detalhes do cenário não foi informado!' });
        }
        if(!newValues){
            return reply.status(400).send({ message: 'Inputs para edição dos detalhes do cenário não foram informados!' });
        }
        // Implement login logic here
        try{
            const result = await db
                .update(projectDetails)
                .set({
                    ...newValues,
                    updatedBy: user.sub,
                    updatedAt: sql`NOW()`,
                })
                .where(eq(projectDetails.id, Number( id )))
                .returning()

            if(result.length === 0){
                return reply.status(400).send({ message: 'Erro ao editar os detalhes do cenário' });
            }
            return reply.status(200).send({ data: result[0] });
        }catch (error : any) {
            // throw error
            console.log(error)
            return reply.status(400).send({ message: error || 'Erro ao editar os detalhes do cenário' });
        }
    });
};