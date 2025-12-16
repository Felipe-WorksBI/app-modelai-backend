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
import { editUserByID } from "./routes/edit-user-by-id.js";
import { deleteUserByID } from "./routes/delete-user-by-id.js";
import { editAdmExpenses } from "./routes/edit-adm-expenses.js";
import { deleteAdmExpensesById } from "./routes/delete-adm-expenses.js";
import { editConstructionCostsById } from "./routes/edit-construction-costs.js";
import { deleteConstructionCostsById } from "./routes/delete-construction-costs.js";
import { createRealEstate } from "./routes/real-estate/create-real-estate.js";
import { editRealEstateById } from "./routes/real-estate/edit-real-estate.js";
import { deleteRealEstateById } from "./routes/real-estate/delete-real-estate.js";
import { getAllRealEstate } from "./routes/real-estate/get-all-real-estate.js";
import { getRealEstatePayments } from "./routes/real-estate-payments/read-re-payments.js";
import { deleteRealEstatePaymentById } from "./routes/real-estate-payments/delete-re-payment.js";
import { createRealEstatePayment } from "./routes/real-estate-payments/create-re-payments.js";
import { editRealEstatePayment } from "./routes/real-estate-payments/update-re-payments.js";
import { createPreRegister } from "./routes/preRegister/create-preRegister.js";
import { updatePreRegister } from "./routes/preRegister/update-preRegister.js";
import { readPreRegister } from "./routes/preRegister/read-preRegister.js";
import { deletePreRegister } from "./routes/preRegister/delete-preRegister.js";
import { createCompany } from "./routes/companies/create-company.js";
import { readCompany } from "./routes/companies/read-company.js";
import { updateCompany } from "./routes/companies/update-company.js";
import { deleteCompany } from "./routes/companies/delete-company.js";
import { createAcquisition } from "./routes/propertyAcquisitions/create-propAcquisition.js";
import { updateAcquisition } from "./routes/propertyAcquisitions/update-propAcquisition.js";
import { readAcquisitions } from "./routes/propertyAcquisitions/read-propAcquisition.js";
import { deleteAcquisition } from "./routes/propertyAcquisitions/delete-propAcquisition.js";
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
    .register(editConstructionCostsById, { prefix: "/api/v1" })
    .register(deleteConstructionCostsById, { prefix: "/api/v1" })
    .register(createAdmExpenses, { prefix: "/api/v1" })
    .register(getAdmExpensesByScenario, { prefix: "/api/v1" })
    .register(deleteScenarioById, { prefix: "/api/v1" })
    .register(editUserByID, { prefix: "/api/v1" })
    .register(deleteUserByID, { prefix: "/api/v1" })
    .register(editAdmExpenses, { prefix: "/api/v1" })
    .register(deleteAdmExpensesById, { prefix: "/api/v1" })
    .register(createRealEstate, { prefix: "/api/v1" })
    .register(editRealEstateById, { prefix: "/api/v1" })
    .register(deleteRealEstateById, { prefix: "/api/v1" })
    .register(getAllRealEstate, { prefix: "/api/v1" })
    // Real Estate Payments
    .register(getRealEstatePayments, { prefix: "/api/v1" })
    .register(deleteRealEstatePaymentById, { prefix: "/api/v1" })
    .register(createRealEstatePayment, { prefix: "/api/v1" })
    .register(editRealEstatePayment, { prefix: "/api/v1" })
    // Companies
    .register(createPreRegister, { prefix: "/api/v1" })
    .register(readPreRegister, { prefix: "/api/v1" })
    .register(updatePreRegister, { prefix: "/api/v1" })
    .register(deletePreRegister, { prefix: "/api/v1" })
    // Pre register
    .register(createCompany, { prefix: "/api/v1" })
    .register(readCompany, { prefix: "/api/v1" })
    .register(updateCompany, { prefix: "/api/v1" })
    .register(deleteCompany, { prefix: "/api/v1" })
    // Property Acquisitions
    .register(createAcquisition, { prefix: "/api/v1" })
    .register(readAcquisitions, { prefix: "/api/v1" })
    .register(updateAcquisition, { prefix: "/api/v1" })
    .register(deleteAcquisition, { prefix: "/api/v1" })
    
export {app};


//   return app;
// }




