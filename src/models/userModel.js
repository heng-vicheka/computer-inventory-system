import { client } from '../db/client.js'

export async function getUsers() {
	const result = await client.execute(`
		SELECT
			u.id, u.name, u.email, u.status,
			r.name AS role,
			COUNT(CASE WHEN h.date_checked_out IS NULL AND h.is_deleted = 0 THEN 1 END) AS assets
		FROM users u
		JOIN user_roles r ON r.id = u.user_role_id
		LEFT JOIN history h ON h.user_id = u.id
		WHERE u.is_deleted = 0
		GROUP BY u.id
		ORDER BY u.name
	`)
	return result.rows
}

export async function getUserById(id) {
	const result = await client.execute({
		sql: 'SELECT id, name, email, user_role_id, status FROM users WHERE id = ? AND is_deleted = 0',
		args: [id],
	})
	return result.rows[0] ?? null
}

export async function getUserRoles() {
	const result = await client.execute('SELECT id, name FROM user_roles ORDER BY name')
	return result.rows
}
