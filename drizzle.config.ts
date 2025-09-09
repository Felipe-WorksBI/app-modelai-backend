import {defineConfig} from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

export default defineConfig({
 dialect: 'postgresql',
 dbCredentials:{
    url: process.env.DATABASE_URL
 },
 out: './migrations',
 schema: "./src/models/**/*.ts" // pega todos os arquivos .ts de models
})
