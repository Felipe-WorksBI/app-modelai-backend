import { db } from './client.ts'
import { sql } from 'drizzle-orm'

await db.execute(sql`DROP SCHEMA public CASCADE`);
await db.execute(sql`DROP SCHEMA drizzle CASCADE`);
await db.execute(sql`CREATE SCHEMA public`);
// "db:reset": "tsx --env-file=.env src/database/reset-db.ts", 