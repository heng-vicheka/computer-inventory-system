import { createHash } from 'node:crypto'
import { eq, and } from 'drizzle-orm'
import { getCookieValue } from '../utils/cookies.js'
import { verifyJwt } from '../utils/jwt.js'
import { db } from '../db/db.js'
import { apiKeys } from '../db/schema.js'

function readBearerToken(header) {
	if (!header || typeof header !== 'string') return ''
	const [type, token] = header.trim().split(/\s+/)
	if (type !== 'Bearer' || !token) return ''
	return token
}

export function authenticateApiJwt(req, res, next) {
	const bearerToken = readBearerToken(req.headers.authorization)
	const cookieToken = getCookieValue(req.headers.cookie, 'auth_token')
	const token = bearerToken || cookieToken

	if (!token) {
		return res.status(401).json({ message: 'Authentication token is required.' })
	}

	try {
		req.auth = verifyJwt(token)
		return next()
	} catch {
		return res.status(401).json({ message: 'Invalid or expired authentication token.' })
	}
}

export function requireAdmin(req, res, next) {
	if (!req.auth || req.auth.role !== 'Admin') {
		return res.status(403).json({ message: 'Admin access required.' })
	}
	return next()
}

export async function authenticateApiKeyOrJwt(req, res, next) {
	const apiKeyHeader = req.headers['x-api-key']

	if (apiKeyHeader) {
		try {
			const keyHash = createHash('sha256').update(apiKeyHeader).digest('hex')
			const [keyRecord] = await db
				.select({ id: apiKeys.id, status: apiKeys.status, isDeleted: apiKeys.isDeleted })
				.from(apiKeys)
				.where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isDeleted, false)))
				.limit(1)

			if (!keyRecord || !keyRecord.status) {
				return res.status(401).json({ message: 'Invalid or revoked API key.' })
			}

			req.auth = { role: 'ApiKey', apiKeyId: keyRecord.id }
			return next()
		} catch {
			return res.status(401).json({ message: 'API key validation failed.' })
		}
	}

	return authenticateApiJwt(req, res, next)
}
