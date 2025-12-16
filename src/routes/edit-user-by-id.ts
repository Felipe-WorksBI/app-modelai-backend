import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createUserSchema } from "../validators/user.schema.js";
import { createUser, getUserById } from "../controllers/user.controller.js";
import z from "zod";
import { TParams } from "../types/zod.types.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { checkUserRole } from "./hooks/check-user-role.js";
import { db } from "../database/client.js";
import { users } from "../models/schema.js";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

export const editUserByID: FastifyPluginAsyncZod = async (app) => {
  //Route to get a user by ID
  app.put("/users/:id",{
    preHandler: [
      checkRequestJWT,
      checkUserRole('admin')
    ],
    schema:{
      tags:['users'],
      summary:'Edit user by ID',
      params: z.object({
        id: z.uuid()
      }),
      body:z.object({
        name: z.string(),
        email: z.email(),
        password: z.string().min(6),
        role: z.enum(['user', 'admin']),
        companyId: z.string().optional(),
        status: z.enum(['active', 'inactive'])
        }),
      response:{
        200: z.object({
            message: z.string()
        }).describe('User edited successfully'),
        400: z.object({ message: z.string() }).describe('Access denied'),
        401: z.object({ message: z.string() }).describe('User was not edited successfully')
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

    const { password } = request.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(password, salt); 

    try{
        const updated = await db
            .update(users)
            .set({
                ...request.body,
                password: hashedPwd,
                updatedAt: sql`NOW()`
            })
            .where(eq(users.id, id))
            .returning()
        if (updated.length === 0){
            return reply.status(401).send({ message: 'Erro ao editar o usuário' });
        }
        return reply.status(200).send({message: 'Usuário editado com sucesso!'});
    }catch(error: any){
        return reply.status(401).send({ message: 'Erro ao editar o usuário'+ error.message });
    }
    })
}
