import Fastify from "fastify";
import {
    validatorCompiler,
    serializerCompiler,
    type ZodTypeProvider,
    jsonSchemaTransform
} from 'fastify-type-provider-zod';
import cors from "@fastify/cors";
import cookie from '@fastify/cookie';
// import fJWT from '@fastify/jwt';

// import fCookie from '@fastify/cookie'
import { userRoutes } from "./routes/user.routes.js";
import { fastifySwagger } from "@fastify/swagger";
import scalarAPIReference from '@scalar/fastify-api-reference';
import { authRoutes } from "./routes/auth.routes.js";
import { projectRoutes } from "./routes/project.routes.js";
import { prjDetailsRoutes } from "./routes/project-details.routes.js";
import { getProperty } from "./routes/get-all-properties.js";
import { createProperty } from "./routes/create-property.js";
import { deletePropertyById } from "./routes/delete-property-by-id.js";
import { getConstructionCosts } from "./routes/get-construction-costs.js";
import { createConstructionCosts } from "./routes/create-construction-costs.js";
import { createAdmExpenses } from "./routes/create-adm-expenses.js";
import { getAdmExpensesByScenario } from "./routes/get-adm-expenses.js";
import { deleteScenarioById } from "./routes/delete-scenario-by-id.js";
// import {fastifySwaggerUi} from "@fastify/swagger-ui";

// export async function App(): Promise<FastifyInstance>{
const app = Fastify({ 
    logger: {
        transport: {
            target: "pino-pretty",
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore:'pid,hostname'
            }
        }
    } 
}).withTypeProvider<ZodTypeProvider>();

//Type Providers
app.setSerializerCompiler(serializerCompiler); // Serializing response data
app.setValidatorCompiler(validatorCompiler); // Checking entry data

//Allowed Cors
// Configuração CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
await app.register(cors, {
    origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
    } else {
        cb(new Error(`Not allowed by CORS: ${origin}`), false);
    }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

await app.register(cookie);

// app.setErrorHandler()

// Swagger (OpenAPI)
await app.register(fastifySwagger, {
    openapi: {
    info: {
        title: "API Backend",
        description: "Documentação da API com Fastify, Drizzle e Zod",
        version: "1.0.0",
    },
    },
    transform:  jsonSchemaTransform
});

await app.register(scalarAPIReference, {
    routePrefix: "/docs",
    configuration:{
        theme: 'kepler'
    }
    // uiConfig: {
    // docExpansion: "list",
    // deepLinking: false,
    // },
});

// Rotas
app
    .register(userRoutes, { prefix: "/api/v1" })
    .register(authRoutes, { prefix: "/api/v1" })
    .register(projectRoutes, { prefix: "/api/v1" })
    .register(prjDetailsRoutes, { prefix: "/api/v1" })
    .register(getProperty, { prefix: "/api/v1" })
    .register(createProperty, { prefix: "/api/v1" })
    .register(deletePropertyById, { prefix: "/api/v1" })
    .register(getConstructionCosts, { prefix: "/api/v1" })
    .register(createConstructionCosts, { prefix: "/api/v1" })
    .register(createAdmExpenses, { prefix: "/api/v1" })
    .register(getAdmExpensesByScenario, { prefix: "/api/v1" })
    .register(deleteScenarioById, { prefix: "/api/v1" })

export {app};


//   return app;
// }




