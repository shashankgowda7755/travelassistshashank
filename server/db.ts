import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use a default local database URL for development if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/personal_assistant_dev';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set. Using default local database URL for development.');
  console.warn('⚠️  Database operations may fail until a proper database is configured.');
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });