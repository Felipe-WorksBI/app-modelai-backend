import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createUserSchema } from "../validators/user.schema.js";
import { createUser, getUserById } from "../controllers/user.controller.js";
import z from "zod";
import { TParams } from "../types/zod.types.js";
import { checkRequestJWT } from "./hooks/check-request-jwt.js";
import { checkUserRole } from "./hooks/check-user-role.js";
import { db } from "../database/client.js";
import { users } from "../models/schema.js";

export const userRoutes: FastifyPluginAsyncZod = async (app) => {
  //Route to get all users
  app.get('/users',{
    preHandler: [
      checkRequestJWT,
      checkUserRole("admin")
    ],
    schema:{
      tags:['users'],
      summary:'Get all users',
      response:{
        200: z.object({
          users:z.array(z.object({
          id: z.uuid(),
          name: z.string().min(2).max(100),
          email: z.email(),
          status: z.string(),
          role: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }))
        }).describe('Users retrieved successfully')
      }
    }
  }, async(request,reply) => {
    
      const result = await db
          .select({
              id: users.id,
              name: users.name,
              email: users.email,
              status: users.status,
              role: users.role,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
          })
          .from(users);
          
      return reply.status(200).send({ users: result });
  });

  //Route to create a new user
  app.post("/users", {
    preHandler: [
      // checkRequestJWT,
      // checkUserRole('admin')
    ],
    schema: {
      tags:['users'],
      summary:'Create a user',
      description: 'Create a new user with name, email, password, role, and status.',
      body: createUserSchema,
      response:{
        201: z.object({createdUser: z.uuid()}).describe('User created successfully'),
        400: z.object({ error: z.string() }).describe('Error on creating user')
      }
    }
  }, createUser);

  //Route to get a user by ID
  app.get("/users/:id",{
    preHandler: [
      checkRequestJWT
    ],
    schema:{
      tags:['users'],
      summary:'Get a user by ID',
      params:TParams,
      response:{
        200: z.object({
            user:z.object({
            id: z.uuid(),
            name: z.string(),
            email: z.email(),
            status: z.enum(['active', 'inactive']),
            role: z.enum(['user', 'admin']),
            createdAt: z.date(),
            updatedAt: z.date(),
          })
        }).describe('User retrieved successfully'),
        404: z.object({ error: z.string() }).describe('User not found')
      }
    }
  }, getUserById);

}
