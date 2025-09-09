import type { FastifyRequest, FastifyReply} from 'fastify';
import { getAuthenticatedUser } from '../../utils/get-authenticated-user.ts';

export function checkUserRole(role:'user' | 'admin'){
    return async function (request: FastifyRequest, reply: FastifyReply){
        const user = getAuthenticatedUser(request);
        if (!user) {
            return reply.status(401).send();
        }
        if (user.role !== role) {
            return reply.status(401).send();
        }
        console.log(`User authenticated as ${user.role.toUpperCase()}`);
    }
}