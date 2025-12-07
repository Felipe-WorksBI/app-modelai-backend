import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from '../database/client.js';
import { z } from 'zod';
import { users } from "../models/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from 'bcryptjs';
import { baseCookies, clearCookies, generateTokens } from "../controllers/auth.controller.js";
import { checkRefreshToken, checkRequestJWT } from "./hooks/check-request-jwt.js";


export const authRoutes: FastifyPluginAsyncZod = async (server) => {
    server.post('/sessions', {
        schema: {
            tags: ['auth'],
            summary: 'User login',
            body: z.object({
                email: z.email(),
                password: z.string(),
            }),
            response:{
                200:z.object({
                user:z.object({
                    id: z.uuid(),
                    name: z.string(),
                    email: z.email(),
                    role: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                })
                }).describe('User retrieved successfully'),

                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const { email, password } = request.body;

        // Implement login logic here
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if(result.length === 0){
            return reply.status(400).send({ message: 'Invalid credentials' });
        }

        const {password: userPwd, ...user} = result[0];

        const isPasswordValid = await bcrypt.compare(password, userPwd);

        if (!isPasswordValid) {
            return reply.status(400).send({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken, session } = generateTokens({
            sub: user.id,
            role: user.role,
        })

        reply
            .setCookie('accessToken',accessToken,{...baseCookies, maxAge:15 * 60})
            .setCookie('refreshToken',refreshToken,{...baseCookies, maxAge:7 * 24 * 60 * 60})
            .setCookie('session', session, {...baseCookies, maxAge:15 * 60})

        return reply.status(200).send({ user });
    });
    server.post('/sessions/logout', {
        preHandler: [
            checkRequestJWT
        ],
        schema: {
            tags: ['auth'],
            summary: 'User logout',
            response:{
                200: z.object({
                    message: z.string().optional(),
                }),
                400: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        reply
            .clearCookie('accessToken', {...baseCookies, maxAge:0})
            .clearCookie('refreshToken', {...baseCookies, maxAge:0})
            .clearCookie('session', {...baseCookies, maxAge:0});
        console.log('cookies removed');
        return reply.status(200).send({ message: 'Cookies cleared' });
    });
    server.post('/sessions/refresh', {
        preHandler:[
            checkRefreshToken
        ],
        schema: {
            tags: ['auth'],
            summary: 'Refresh user token with refreshToken',
            // body: z.object({
            //     email: z.email(),
            //     password: z.string(),
            // }),
            response:{
                200:z.object({message:z.string()}).describe('Token refreshed successfully'),
                // 200: z.object({
                //     token: z.object({
                //         accessToken: z.string(),
                //         refreshToken: z.string(),
                //     }),
                // }),
                401: z.object({ message: z.string() })
            }
        },
    }, async (request, reply) => {
        const user = request.user;
        if(!user){
            clearCookies(reply);
            return reply.status(401).send({ message: 'User not authenticated' });
        }
        const { accessToken, refreshToken, session } = generateTokens({
            sub: user.sub,
            role: user.role,
        })
        reply
            .setCookie('accessToken',accessToken,{...baseCookies, maxAge:15 * 60})
            .setCookie('refreshToken',refreshToken,{...baseCookies, maxAge:7 * 24 * 60 * 60})
            .setCookie('session', session, {...baseCookies, maxAge:15 * 60})
            
        return reply.status(200).send({ message: 'Token refreshed successfully' });
    });
};