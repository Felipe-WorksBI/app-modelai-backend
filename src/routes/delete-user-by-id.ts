import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { checkUserRole } from "./hooks/check-user-role.js";
import { db } from "../database/client.js";
import { users } from "../models/schema.js";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

export const deleteUserByID: FastifyPluginAsyncZod = async (app) => {
  //Route to get a user by ID
  app.delete("/users/:id",{
    preHandler: [
      checkRequestJWT,
      checkUserRole('admin')
    ],
    schema:{
      tags:['users'],
      summary:'Delete user by ID',
      params: z.object({
        id: z.uuid()
      }),
      response:{
        200: z.object({
            message: z.string()
        }).describe('User deleted successfully'),
        400: z.object({ message: z.string() }).describe('Access denied'),
        401: z.object({ message: z.string() }).describe('User was not deleted successfully')
      }
    }
  }, async(request, reply)=>{   
    const user = request.user;
    if (!user || user.role !== 'admin'){
        return reply.status(400).send({ message: 'Você não tem as permissões necessárias para editar' });
    }
    const { id } = request.params
    if (!id){
        return reply.status(401).send({ message: 'ID do usuário não foi informado' });
    }

    try{
        const deleted = await db
            .delete(users)
            .where(eq(users.id, id))
        if (deleted.length === 0){
            return reply.status(401).send({ message: 'Erro ao deletar o usuário' });
        }
        return reply.status(200).send({message: 'Usuário deletado com sucesso!'});
    }catch(error: any){
        return reply.status(401).send({ message: 'Erro ao deletar o usuário'+ error.message });
    }
    })
}
