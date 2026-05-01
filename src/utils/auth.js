import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../db/db.js'
import { userRoles, users } from '../db/schema.js'
import { signJwt } from './jwt.js'

function mapUserRole(roleName) {
	if (roleName === 'Admin') return 'Admin'
	return 'Technician'
}

async function verifyPassword(inputPassword, userRecord) {
	const candidate = String(inputPassword || '')
	if (!candidate) return false

	if (userRecord.passwordHash) {
		try {
			return await bcrypt.compare(candidate, userRecord.passwordHash)
		} catch {
			return false
		}
	}

	return false
}

export async function authenticateUser(email, password) {
	const normalizedEmail = String(email || '')
		.trim()
		.toLowerCase()
	if (!normalizedEmail) return { user: null, reason: 'invalid_credentials' }

	const [userRecord] = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			status: users.status,
			passwordHash: users.passwordHash,
			roleName: userRoles.name,
		})
		.from(users)
		.leftJoin(userRoles, eq(users.userRoleId, userRoles.id))
		.where(eq(users.email, normalizedEmail))
		.limit(1)

	if (!userRecord) {
		return { user: null, reason: 'invalid_credentials' }
	}

	if (String(userRecord.status || '').toLowerCase() !== 'active') {
		return { user: null, reason: 'inactive_user' }
	}

	const passwordOk = await verifyPassword(password, userRecord)
	if (!passwordOk) {
		return { user: null, reason: 'invalid_credentials' }
	}

	const user = {
		id: userRecord.id,
		name: userRecord.name,
		email: userRecord.email,
		role: mapUserRole(userRecord.roleName),
	}

	return { user, reason: null }
}

export function issueAuthToken(user) {
	return signJwt({
		sub: String(user.id),
		name: user.name,
		email: user.email,
		role: user.role,
	})
}

export function getAuthCookieOptions() {
	return {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	}
}
