import { client } from '../db/client.js'

export async function getAvailableDevices() {
	const result = await client.execute(`
		SELECT d.id, d.serial_number, d.model_name
		FROM devices d
		JOIN device_statuses ds ON ds.id = d.device_status_id
		WHERE d.is_deleted = 0 AND ds.name = 'Available'
		ORDER BY d.model_name
	`)
	return result.rows
}

export async function getActiveUsers() {
	const result = await client.execute(`
		SELECT id, name, email FROM users
		WHERE is_deleted = 0 AND status = 'active'
		ORDER BY name
	`)
	return result.rows
}

export async function getActiveCheckouts() {
	const result = await client.execute(`
		SELECT h.id, d.serial_number, d.model_name,
		       u.id AS user_id, u.name AS user_name
		FROM history h
		JOIN devices d ON d.id = h.device_id
		JOIN users  u ON u.id = h.user_id
		WHERE h.is_deleted = 0 AND h.date_checked_out IS NULL
		ORDER BY h.date_checked_in DESC
	`)
	return result.rows
}

export async function getTransactionHistory() {
	const result = await client.execute(`
		SELECT
			h.id,
			d.id           AS device_id,
			d.serial_number,
			d.model_name,
			u.name         AS user_name,
			h.date_checked_in  AS checkout_date,
			h.date_checked_out AS return_date
		FROM history h
		JOIN devices d ON d.id = h.device_id
		JOIN users  u ON u.id = h.user_id
		WHERE h.is_deleted = 0
		ORDER BY d.serial_number, h.date_checked_in DESC
	`)
	return result.rows
}
