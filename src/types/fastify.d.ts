import fastify from "fastify";
import { TokenPayload } from "../controllers/auth.controller.ts";

declare module "fastify" {
    export interface FastifyRequest {
        user?: TokenPayload;
        authCookies?:{
            accessToken:string
            refreshToken:string
        }
    }
}