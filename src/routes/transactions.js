import { Router } from 'express'
import { client } from '../db/client.js'

const router = Router()

// ─── Combined check-in / out page ────────────────────────────────────────────

router.get('/', async (req, res) => {
	const [devicesResult, usersResult, checkoutsResult] = await Promise.all([
		client.execute(`
			SELECT d.id, d.serial_number, d.model_name
			FROM devices d
			JOIN device_statuses ds ON ds.id = d.device_status_id
			WHERE d.is_deleted = 0 AND ds.name = 'Available'
			ORDER BY d.model_name
		`),
		client.execute(`
			SELECT id, name, email FROM users
			WHERE is_deleted = 0 AND status = 'active'
			ORDER BY name
		`),
		client.execute(`
			SELECT h.id, d.serial_number, d.model_name,
			       u.id AS user_id, u.name AS user_name
			FROM history h
			JOIN devices d ON d.id = h.device_id
			JOIN users  u ON u.id = h.user_id
			WHERE h.is_deleted = 0 AND h.date_checked_out IS NULL
			ORDER BY h.date_checked_in DESC
		`),
	])

	let flash = null
	if (req.query.checkedOut) flash = { type: 'success', message: 'Device checked out successfully.' }
	else if (req.query.checkedIn)
		flash = { type: 'success', message: 'Device checked in successfully.' }
	else if (req.query.error) flash = { type: 'danger', message: decodeURIComponent(req.query.error) }

	res.render('transactions/index', {
		title: 'Check-in / Out',
		availableDevices: devicesResult.rows,
		users: usersResult.rows,
		activeCheckouts: checkoutsResult.rows,
		flash,
	})
})

// ─── Check out ────────────────────────────────────────────────────────────────

router.post('/checkout', async (req, res) => {
	const { deviceId, userId } = req.body

	if (!deviceId || !userId) {
		return res.redirect(
			'/transactions?error=' + encodeURIComponent('Please select both a device and a user.'),
		)
	}

	const statusRow = await client.execute(`SELECT id FROM device_statuses WHERE name = 'In Use'`)
	const inUseId = statusRow.rows[0]?.id

	await client.execute({
		sql: `INSERT INTO history (device_id, user_id, date_checked_in) VALUES (?, ?, CURRENT_TIMESTAMP)`,
		args: [parseInt(deviceId), parseInt(userId)],
	})

	if (inUseId) {
		await client.execute({
			sql: `UPDATE devices SET device_status_id = ?, date_updated = CURRENT_TIMESTAMP WHERE id = ?`,
			args: [inUseId, parseInt(deviceId)],
		})
	}

	return res.redirect('/transactions?checkedOut=1')
})

// ─── Check in ─────────────────────────────────────────────────────────────────

router.post('/checkin', async (req, res) => {
	const { historyId } = req.body

	if (!historyId) {
		return res.redirect(
			'/transactions?error=' + encodeURIComponent('Please select an item to check in.'),
		)
	}

	const hist = await client.execute({
		sql: `SELECT id, device_id FROM history WHERE id = ? AND date_checked_out IS NULL AND is_deleted = 0`,
		args: [historyId],
	})

	if (!hist.rows.length) return res.redirect('/transactions')

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

	return res.redirect('/transactions?checkedIn=1')
})

// ─── History table ────────────────────────────────────────────────────────────

router.get('/history', async (_req, res) => {
	const result = await client.execute(`
		SELECT
			h.id,
			d.serial_number,
			d.model_name,
			u.name  AS user_name,
			u.email AS user_email,
			h.date_checked_in  AS checkout_date,
			h.date_checked_out AS return_date
		FROM history h
		JOIN devices d ON d.id = h.device_id
		JOIN users  u ON u.id = h.user_id
		WHERE h.is_deleted = 0
		ORDER BY h.date_checked_in DESC
	`)

	res.render('transactions/history', { title: 'Asset History', transactions: result.rows })
})

export default router
