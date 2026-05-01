import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import 'dotenv/config'
import * as schema from './schema.js'

const dbUrl = process.env.TURSO_DATABASE_URL
const dbAuthToken = process.env.TURSO_AUTH_TOKEN

if (!dbUrl) {
	throw new Error(
		'Missing TURSO_DATABASE_URL environment variable. Set it in Vercel Project Settings -> Environment Variables.',
	)
}

if (!dbAuthToken) {
	throw new Error(
		'Missing TURSO_AUTH_TOKEN environment variable. Set it in Vercel Project Settings -> Environment Variables.',
	)
}

export const client = createClient({
	url: dbUrl,
	authToken: dbAuthToken,
})

export const db = drizzle(client, { schema })
