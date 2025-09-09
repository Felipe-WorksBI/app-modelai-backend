import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { CreateUserInput } from '../validators/user.schema.ts';
import { db } from '../database/client.ts';
import { users } from '../models/schema.ts';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '../utils/get-authenticated-user.ts';

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPwd = await bcrypt.hash(password, salt);
  return hashedPwd;
};

export async function createUser(
    request: FastifyRequest, 
    reply: FastifyReply
){
    const userData = request.body as CreateUserInput;
    const hashedPassword = await hashPassword(userData.password);
    if (!userData.name || !userData.email || !userData.password) {
        return reply.status(400).send({ error: 'Name, email, and password are required.' });
    }

    const result = await db
        .insert(users)
        .values({
            ...userData,
            password: hashedPassword
        })
        .returning();
    
    // if(!result){
    //     return reply.status(500).send({ error: 'Failed to create user.' });
    // }

    return reply.status(201).send({createdUser: result[0].id})
}


export async function getAllUsers(
    request: FastifyRequest,
    reply: FastifyReply
){

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
}

export async function getUserById(
    request: FastifyRequest,
    reply: FastifyReply
){
    if (!request.params) {
        return reply.status(400).send({ error: 'User ID is required.' });
    }
    const user = getAuthenticatedUser(request);
    // console.log(user.sub);
    const params = request.params as { id: string };
    const userId = params.id;

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
        .from(users)
        .where(eq(users.id, userId));

    if(result.length > 0){
        return reply.status(200).send({ user: result[0] });
    }

    return reply.status(404).send({ error: 'User not found.' });
}