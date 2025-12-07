import jwt from 'jsonwebtoken';
import {FastifyReply} from 'fastify'

export const isProduction = process.env.NODE_ENV === 'production'
export const sameSiteType: 'none' | 'strict' = isProduction ? 'none' : 'strict'

export type TokenPayload = {
    sub: string
    role: string
}

type CookieOptions = {
  path: string
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'none' //'strict' | 'lax' | 'none'
  maxAge?: number
}

export const baseCookies : CookieOptions= {
    path: '/',
    httpOnly: true,
    secure: isProduction, //isProduction,
    sameSite: sameSiteType//sameSiteType,
}

export function generateTokens(
  payload: TokenPayload
) {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET || !process.env.JWT_PRIVATE_KEY_PEM) {
        throw new Error('JWT_SECRET or JWT_EXPIRES_IN is not defined')
    }
    if (!payload.sub || !payload.role) {
        throw new Error('Invalid token payload')
    }
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  })

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  })

  const session = jwt.sign(payload, process.env.JWT_PRIVATE_KEY_PEM , {
    expiresIn: '15m',
    algorithm: 'RS256'
  })

  return { accessToken, refreshToken, session }
}

export function generateCookies(
  reply: FastifyReply, 
  name: 'accessToken'|'refreshToken',
  token: string,
  expiration: '7d' | '15m',
) {
  if(!token){
    throw new Error('Token is required')
  }
  const maxAge = expiration === '7d' ? 7 * 24 * 60 * 60 : 15 * 60 

  const cookieOptions: CookieOptions = {
    ...baseCookies,
    maxAge
  }
  // console.log(cookieOptions)
  // Set the cookie with the specified name and options
  return reply.setCookie(
    name,
    token,
    {...cookieOptions}
  )
}

export async function clearCookies(
  reply: FastifyReply
) {
  // const clearOptions = {
  //   secure: isProduction,
  //   sameSite: sameSiteType,
  //   path: '/',
  // }
  reply
    .clearCookie('accessToken', {...baseCookies, maxAge:0})
    .clearCookie('refreshToken', {...baseCookies, maxAge:0})

  return reply;
}

// export const signIn = async (request, reply) => {
//     try{

//     }catch(error){
//         throw error
//     }
// }