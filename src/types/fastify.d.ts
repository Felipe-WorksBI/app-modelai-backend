import fastify from "fastify";

declare module "fastify" {
    export interface FastifyRequest {
        user?: {
            sub: string
            role: string
        };
        authCookies?:{
            accessToken:string
            refreshToken:string
        }
    }
}