import { Router } from 'express'
import { client } from '../db/client.js'

const router = Router()

router.get('/', async (req, res) => {
	const result = await client.execute(`
		SELECT
			u.id,
			u.name,
			u.email,
			u.status,
			r.name AS role,
			COUNT(CASE WHEN h.date_checked_out IS NULL AND h.is_deleted = 0 THEN 1 END) AS assets
		FROM users u
		JOIN user_roles r ON r.id = u.user_role_id
		LEFT JOIN history h ON h.user_id = u.id
		WHERE u.is_deleted = 0
		GROUP BY u.id
		ORDER BY u.name
	`)

	let flash = null
	if (req.query.created) flash = { type: 'success', message: 'User created successfully.' }
	else if (req.query.updated) flash = { type: 'success', message: 'User updated successfully.' }
	else if (req.query.deleted) flash = { type: 'warning', message: 'User deleted.' }

	res.render('users/index', { title: 'Users', users: result.rows, flash })
})

router.get('/new', async (_req, res) => {
	const roles = await client.execute('SELECT id, name FROM user_roles ORDER BY name')
	res.render('users/new', { title: 'Create User', roles: roles.rows })
})

router.post('/', async (req, res) => {
	const { name, email, userRoleId, status } = req.body
	const errors = []

	if (!name?.trim()) errors.push('Name is required.')
	if (!email?.trim()) errors.push('Email is required.')
	if (!userRoleId) errors.push('Role is required.')
	if (!status) errors.push('Status is required.')

	const rerender = async (extra = {}) => {
		const roles = await client.execute('SELECT id, name FROM user_roles ORDER BY name')
		return res.status(422).render('users/new', {
			title: 'Create User',
			roles: roles.rows,
			errors,
			values: { name, email, userRoleId: parseInt(userRoleId) || 0, status },
			...extra,
		})
	}

	if (errors.length) return rerender()

	const dup = await client.execute({
		sql: 'SELECT id FROM users WHERE email = ? AND is_deleted = 0',
		args: [email.trim().toLowerCase()],
	})
	if (dup.rows.length) {
		errors.push('A user with this email already exists.')
		return rerender()
	}

	await client.execute({
		sql: 'INSERT INTO users (name, email, user_role_id, status) VALUES (?, ?, ?, ?)',
		args: [name.trim(), email.trim().toLowerCase(), parseInt(userRoleId), status],
	})

	return res.redirect('/users?created=1')
})

router.get('/:id/edit', async (req, res) => {
	const [userResult, rolesResult] = await Promise.all([
		client.execute({
			sql: 'SELECT id, name, email, user_role_id, status FROM users WHERE id = ? AND is_deleted = 0',
			args: [req.params.id],
		}),
		client.execute('SELECT id, name FROM user_roles ORDER BY name'),
	])

	if (!userResult.rows.length) return res.redirect('/users')

	return res.render('users/edit', {
		title: 'Edit User',
		user: userResult.rows[0],
		roles: rolesResult.rows,
	})
})

router.post('/:id', async (req, res) => {
	const { name, email, userRoleId, status } = req.body
	const errors = []

	if (!name?.trim()) errors.push('Name is required.')
	if (!email?.trim()) errors.push('Email is required.')
	if (!userRoleId) errors.push('Role is required.')
	if (!status) errors.push('Status is required.')

	const fetchCtx = () =>
		Promise.all([
			client.execute({
				sql: 'SELECT id, name, email, user_role_id, status FROM users WHERE id = ? AND is_deleted = 0',
				args: [req.params.id],
			}),
			client.execute('SELECT id, name FROM user_roles ORDER BY name'),
		])

	const rerender = async () => {
		const [u, r] = await fetchCtx()
		return res.status(422).render('users/edit', {
			title: 'Edit User',
			user: { ...u.rows[0], name, email, user_role_id: parseInt(userRoleId) || 0, status },
			roles: r.rows,
			errors,
		})
	}

	if (errors.length) return rerender()

	const dup = await client.execute({
		sql: 'SELECT id FROM users WHERE email = ? AND is_deleted = 0 AND id != ?',
		args: [email.trim().toLowerCase(), req.params.id],
	})
	if (dup.rows.length) {
		errors.push('A user with this email already exists.')
		return rerender()
	}

	await client.execute({
		sql: `UPDATE users
			  SET name = ?, email = ?, user_role_id = ?, status = ?, date_updated = CURRENT_TIMESTAMP
			  WHERE id = ? AND is_deleted = 0`,
		args: [name.trim(), email.trim().toLowerCase(), parseInt(userRoleId), status, req.params.id],
	})

	return res.redirect('/users?updated=1')
})

router.post('/:id/delete', async (req, res) => {
	await client.execute({
		sql: `UPDATE users SET is_deleted = 1, date_deleted = CURRENT_TIMESTAMP
			  WHERE id = ? AND is_deleted = 0`,
		args: [req.params.id],
	})
	res.redirect('/users?deleted=1')
})

export default router
