import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { client } from './db.js'

const ADMIN_EMAIL = 'admin@admin.com'
const ADMIN_PASSWORD = 'Admin@123'
const ADMIN_NAME = 'Admin'

async function main() {
	// Ensure Admin role exists
	const rolesResult = await client.execute({
		sql: "SELECT id FROM user_roles WHERE name = 'Admin' LIMIT 1",
		args: [],
	})

	let adminRoleId
	if (rolesResult.rows.length > 0) {
		adminRoleId = rolesResult.rows[0].id
	} else {
		const inserted = await client.execute({
			sql: "INSERT INTO user_roles (name) VALUES ('Admin') RETURNING id",
			args: [],
		})
		adminRoleId = inserted.rows[0].id
	}

	// Check if admin already exists
	const existing = await client.execute({
		sql: 'SELECT id FROM users WHERE email = ? LIMIT 1',
		args: [ADMIN_EMAIL],
	})

	if (existing.rows.length > 0) {
		console.log(`Admin account already exists: ${ADMIN_EMAIL}`)
		process.exit(0)
	}

	const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

	await client.execute({
		sql: "INSERT INTO users (name, email, user_role_id, password_hash, status) VALUES (?, ?, ?, ?, 'active')",
		args: [ADMIN_NAME, ADMIN_EMAIL, adminRoleId, passwordHash],
	})

	console.log('Admin account created:')
	console.log(`  Email:    ${ADMIN_EMAIL}`)
	console.log(`  Password: ${ADMIN_PASSWORD}`)
}

main().catch((err) => {
	console.error('Failed to seed admin:', err)
	process.exit(1)
})
