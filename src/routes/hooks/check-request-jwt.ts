import type { FastifyRequest, FastifyReply} from 'fastify';
import jwt from 'jsonwebtoken';
import { clearCookies, TokenPayload } from '../../controllers/auth.controller.ts';

export async function checkRequestJWT(request: FastifyRequest, reply: FastifyReply) {
    // const token = request.headers.authorization;
    const token = request.cookies.accessToken; 
    // console.log(token);
    if (!token) {
        console.log('User not authenticated');
        clearCookies(reply);
        return reply.status(401).send();
    }
    
    if(!process.env.JWT_SECRET){
        throw new Error('JWT_SECRET is not defined');
    }

    try {
        const payload =  jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
        request.user = payload; // Attach user info to the request object
        console.log('User authenticated');
        // request.user = decoded; // Attach user info to the request object
        // console.log(payload);
    } catch (error) {
        console.log('User not authenticated');
        clearCookies(reply);
        // console.log(request.cookies);
        return reply.status(401).send();
    }
}

export async function checkRefreshToken(request: FastifyRequest, reply: FastifyReply) {
    // const token = request.headers.authorization;
    const token = request.cookies.refreshToken; 
    // console.log(token);
    if (!token) {
        return reply.status(401).send({message: 'Refresh token is missing'});
    }

    if(!process.env.JWT_REFRESH_SECRET){
        throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET) as TokenPayload;

        request.user = payload; // Attach user info to the request object
        // request.user = decoded; // Attach user info to the request object
        // console.log(payload);
    } catch (error) {
        clearCookies(reply);
        return reply.status(401).send({message: 'Invalid refresh token'});
    }
}