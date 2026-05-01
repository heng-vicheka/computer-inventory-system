import { Router } from 'express'
import { client } from '../db/client.js'

const apiRouter = Router()

// ─── Users ───────────────────────────────────────────────────────────────────

apiRouter.post('/users', async (req, res) => {
	const { name, email, userRoleId, status = 'active' } = req.body

	if (!name || !email || !userRoleId) {
		return res.status(400).json({ error: 'name, email, and userRoleId are required.' })
	}

	const dup = await client.execute({
		sql: 'SELECT id FROM users WHERE email = ? AND is_deleted = 0',
		args: [email.toLowerCase()],
	})
	if (dup.rows.length) return res.status(409).json({ error: 'Email already in use.' })

	const result = await client.execute({
		sql: 'INSERT INTO users (name, email, user_role_id, status) VALUES (?, ?, ?, ?)',
		args: [name.trim(), email.toLowerCase(), parseInt(userRoleId), status],
	})

	return res.status(201).json({ id: Number(result.lastInsertRowid) })
})

apiRouter.put('/users/:id', async (req, res) => {
	const { name, email, userRoleId, status } = req.body
	if (!name || !email || !userRoleId || !status) {
		return res.status(400).json({ error: 'name, email, userRoleId, and status are required.' })
	}
	if (!['active', 'inactive'].includes(status)) {
		return res.status(400).json({ error: 'status must be "active" or "inactive".' })
	}

	const existing = await client.execute({
		sql: 'SELECT id FROM users WHERE id = ? AND is_deleted = 0',
		args: [req.params.id],
	})
	if (!existing.rows.length) return res.status(404).json({ error: 'User not found.' })

	const dup = await client.execute({
		sql: 'SELECT id FROM users WHERE email = ? AND is_deleted = 0 AND id != ?',
		args: [email.trim().toLowerCase(), req.params.id],
	})
	if (dup.rows.length) return res.status(409).json({ error: 'Email already in use.' })

	await client.execute({
		sql: `UPDATE users
			  SET name = ?, email = ?, user_role_id = ?, status = ?, date_updated = CURRENT_TIMESTAMP
			  WHERE id = ? AND is_deleted = 0`,
		args: [name.trim(), email.trim().toLowerCase(), parseInt(userRoleId), status, req.params.id],
	})

	return res.json({ updated: true })
})

apiRouter.delete('/users/:id', async (req, res) => {
	await client.execute({
		sql: `UPDATE users SET is_deleted = 1, date_deleted = CURRENT_TIMESTAMP
			  WHERE id = ? AND is_deleted = 0`,
		args: [req.params.id],
	})
	return res.json({ deleted: true })
})

apiRouter.patch('/users/:id/role', async (req, res) => {
	const { roleId } = req.body
	if (!roleId) return res.status(400).json({ error: 'roleId is required.' })

	const role = await client.execute({
		sql: 'SELECT id FROM user_roles WHERE id = ?',
		args: [roleId],
	})
	if (!role.rows.length) return res.status(404).json({ error: 'Role not found.' })

	await client.execute({
		sql: `UPDATE users SET user_role_id = ?, date_updated = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0`,
		args: [parseInt(roleId), req.params.id],
	})

	return res.json({ updated: true })
})

apiRouter.patch('/users/:id/status', async (req, res) => {
	const { status } = req.body
	if (!['active', 'inactive'].includes(status)) {
		return res.status(400).json({ error: 'status must be "active" or "inactive".' })
	}

	await client.execute({
		sql: `UPDATE users SET status = ?, date_updated = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0`,
		args: [status, req.params.id],
	})

	return res.json({ updated: true })
})

// ─── Transactions ─────────────────────────────────────────────────────────────

apiRouter.post('/transactions/checkout', async (req, res) => {
	const { deviceId, userId } = req.body
	if (!deviceId || !userId) {
		return res.status(400).json({ error: 'deviceId and userId are required.' })
	}

	const device = await client.execute({
		sql: `SELECT d.id FROM devices d
			  JOIN device_statuses ds ON ds.id = d.device_status_id
			  WHERE d.id = ? AND d.is_deleted = 0 AND ds.name = 'Available'`,
		args: [deviceId],
	})
	if (!device.rows.length) return res.status(409).json({ error: 'Device is not available.' })

	const statusRow = await client.execute(`SELECT id FROM device_statuses WHERE name = 'In Use'`)
	const inUseId = statusRow.rows[0]?.id

	const result = await client.execute({
		sql: `INSERT INTO history (device_id, user_id, date_checked_in) VALUES (?, ?, CURRENT_TIMESTAMP)`,
		args: [parseInt(deviceId), parseInt(userId)],
	})

	if (inUseId) {
		await client.execute({
			sql: `UPDATE devices SET device_status_id = ?, date_updated = CURRENT_TIMESTAMP WHERE id = ?`,
			args: [inUseId, parseInt(deviceId)],
		})
	}

	return res.status(201).json({ id: Number(result.lastInsertRowid) })
})

apiRouter.post('/transactions/checkin', async (req, res) => {
	const { historyId } = req.body
	if (!historyId) return res.status(400).json({ error: 'historyId is required.' })

	const hist = await client.execute({
		sql: `SELECT id, device_id FROM history WHERE id = ? AND date_checked_out IS NULL AND is_deleted = 0`,
		args: [historyId],
	})
	if (!hist.rows.length) return res.status(404).json({ error: 'Active checkout not found.' })

	const { device_id } = hist.rows[0]

	const statusRow = await client.execute(`SELECT id FROM device_statuses WHERE name = 'Available'`)
	const availableId = statusRow.rows[0]?.id

	await client.execute({
		sql: `UPDATE history SET date_checked_out = CURRENT_TIMESTAMP WHERE id = ?`,
		args: [historyId],
	})

	if (availableId) {
		await client.execute({
			sql: `UPDATE devices SET device_status_id = ?, date_updated = CURRENT_TIMESTAMP WHERE id = ?`,
			args: [availableId, device_id],
		})
	}

	return res.json({ returned: true })
})

// ─── Not yet implemented ──────────────────────────────────────────────────────

function notImplemented(req, res) {
	return res.status(501).json({
		message: 'Endpoint scaffolded. Implementation pending.',
		method: req.method,
		path: req.originalUrl,
	})
}

apiRouter.post('/auth/login', notImplemented)
apiRouter.post('/keys', notImplemented)
apiRouter.get('/keys', notImplemented)
apiRouter.delete('/keys/:id', notImplemented)
apiRouter.get('/items', notImplemented)
apiRouter.get('/items/:id/history', notImplemented)
apiRouter.post('/items', notImplemented)
apiRouter.put('/items/:id', notImplemented)
apiRouter.delete('/items/:id', notImplemented)

apiRouter.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))

export default apiRouter
