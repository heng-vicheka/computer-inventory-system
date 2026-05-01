import bcrypt from 'bcryptjs'
import { eq, and } from 'drizzle-orm'
import { db, client } from '../db/db.js'
import { users, userRoles, history, apiKeys } from '../db/schema.js'

async function listUsersWithAssets() {
	const userList = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			status: users.status,
			userRoleId: users.userRoleId,
			roleName: userRoles.name,
		})
		.from(users)
		.leftJoin(userRoles, eq(users.userRoleId, userRoles.id))
		.where(eq(users.isDeleted, false))
		.orderBy(users.name)

	const openHistory = await db
		.select({ userId: history.userId })
		.from(history)
		.where(eq(history.isDeleted, false))

	const assetCounts = {}
	openHistory.forEach(({ userId }) => {
		assetCounts[userId] = (assetCounts[userId] || 0) + 1
	})

	return userList.map((u) => {
		const isAdmin = u.roleName === 'Admin'
		return {
			...u,
			roleName: u.roleName || 'Unknown',
			roleClass: isAdmin ? 'admin' : 'tech',
			statusClass: u.status === 'active' ? 'active' : 'disabled',
			statusLabel: u.status === 'active' ? 'Active' : 'Disabled',
			assetCount: assetCounts[u.id] || 0,
		}
	})
}

export const renderUsers = async (_req, res) => {
	try {
		const userList = await listUsersWithAssets()
		res.render('users', { title: 'Users', userList })
	} catch (error) {
		res.status(500).render('error', { message: 'Failed to load users', error: error.message })
	}
}

export const createUser = async (req, res) => {
	const { name, email, password, role } = req.body || {}

	if (!email || !password || !role) {
		return res.status(400).json({ message: 'Email, password, and role are required.' })
	}

	const normalizedEmail = String(email).trim().toLowerCase()

	const desiredRole = role === 'admin' ? 'Admin' : 'Staff'
	const [roleRow] = await db
		.select({ id: userRoles.id })
		.from(userRoles)
		.where(eq(userRoles.name, desiredRole))
		.limit(1)

	if (!roleRow) {
		return res.status(400).json({ message: `Role "${desiredRole}" not found.` })
	}

	const [existing] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, normalizedEmail))
		.limit(1)

	if (existing) {
		return res.status(409).json({ message: 'An account with this email already exists.' })
	}

	const passwordHash = await bcrypt.hash(password, 10)
	const displayName = name?.trim() || normalizedEmail.split('@')[0]

	await client.execute({
		sql: 'INSERT INTO users (name, email, user_role_id, password_hash, status) VALUES (?, ?, ?, ?, ?)',
		args: [displayName, normalizedEmail, roleRow.id, passwordHash, 'active'],
	})

	return res.status(201).json({ message: 'User created successfully.' })
}

export const updateUserRole = async (req, res) => {
	const userId = Number(req.params.id)
	const { role } = req.body || {}

	if (!role) return res.status(400).json({ message: 'Role is required.' })

	const desiredRole = role === 'admin' ? 'Admin' : 'Staff'
	const [roleRow] = await db
		.select({ id: userRoles.id })
		.from(userRoles)
		.where(eq(userRoles.name, desiredRole))
		.limit(1)

	if (!roleRow) return res.status(400).json({ message: `Role "${desiredRole}" not found.` })

	await db
		.update(users)
		.set({ userRoleId: roleRow.id, dateUpdated: new Date().toISOString() })
		.where(eq(users.id, userId))

	return res.status(200).json({ message: 'User role updated.' })
}

export const updateUserStatus = async (req, res) => {
	const userId = Number(req.params.id)
	const { status } = req.body || {}

	if (status !== 'active' && status !== 'inactive') {
		return res.status(400).json({ message: 'Status must be "active" or "inactive".' })
	}

	await db
		.update(users)
		.set({ status, dateUpdated: new Date().toISOString() })
		.where(eq(users.id, userId))

	if (status === 'inactive') {
		const now = new Date().toISOString()
		await db
			.update(apiKeys)
			.set({ status: false, isDeleted: true, dateDeleted: now, dateUpdated: now })
			.where(and(eq(apiKeys.isDeleted, false)))
	}

	return res.status(200).json({ message: `User ${status === 'active' ? 'enabled' : 'disabled'}.` })
}
