import { randomBytes, createHash } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db/db.js'
import { apiKeys } from '../db/schema.js'

export async function createApiKey(_req, label) {
	const cleanLabel = String(label || '').trim()
	if (!cleanLabel) {
		throw new Error('Label is required.')
	}

	const secret = `ci_${randomBytes(24).toString('hex')}`
	const keyHash = createHash('sha256').update(secret).digest('hex')

	const [createdKey] = await db
		.insert(apiKeys)
		.values({
			label: cleanLabel,
			keyHash,
			status: true,
			isDeleted: false,
		})
		.returning({ id: apiKeys.id })
	if (!createdKey?.id) {
		throw new Error('Failed to create API key.')
	}

	return {
		id: createdKey.id,
		label: cleanLabel,
		secret,
	}
}

export async function revokeApiKey(_req, id) {
	const keyId = Number(id)
	if (!Number.isInteger(keyId) || keyId <= 0) {
		throw new Error('Valid API key id is required.')
	}

	const [existing] = await db
		.select({ id: apiKeys.id })
		.from(apiKeys)
		.where(eq(apiKeys.id, keyId))
		.limit(1)

	if (!existing) {
		throw new Error('API key not found.')
	}

	const now = new Date().toISOString()
	await db
		.update(apiKeys)
		.set({
			status: false,
			isDeleted: true,
			dateDeleted: now,
			dateUpdated: now,
		})
		.where(eq(apiKeys.id, keyId))
}

export async function getApiKeys() {
	return db
		.select({
			id: apiKeys.id,
			label: apiKeys.label,
			status: apiKeys.status,
			isDeleted: apiKeys.isDeleted,
			dateCreated: apiKeys.dateCreated,
		})
		.from(apiKeys)
		.orderBy(desc(apiKeys.dateCreated))
}
