import { FastifyRequest } from "fastify";

export function getAuthenticatedUser(request: FastifyRequest){
    const user = request.user;
    if (!user){
        throw new Error('User not authenticated');
    }
    return user;
}