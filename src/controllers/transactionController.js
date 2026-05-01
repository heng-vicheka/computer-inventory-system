import {
	getAvailableDevices,
	getActiveUsers,
	getActiveCheckouts,
	getTransactionHistory,
} from '../models/transactionModel.js'

export const renderTransactions = async (_req, res) => {
	try {
		const [availableDevices, users, activeCheckouts] = await Promise.all([
			getAvailableDevices(),
			getActiveUsers(),
			getActiveCheckouts(),
		])
		res.render('transactions/index', {
			title: 'Check-in / Out',
			availableDevices,
			users,
			activeCheckouts,
		})
	} catch (err) {
		res.status(500).render('error', { message: 'Failed to load transactions', error: err.message })
	}
}

export const renderTransactionHistory = async (_req, res) => {
	try {
		const rows = await getTransactionHistory()

		const deviceMap = new Map()
		for (const row of rows) {
			if (!deviceMap.has(row.device_id)) {
				deviceMap.set(row.device_id, {
					serial_number: row.serial_number,
					model_name: row.model_name,
					entries: [],
				})
			}
			const device = deviceMap.get(row.device_id)

			if (row.return_date) {
				const days = Math.round(
					(new Date(row.return_date) - new Date(row.checkout_date)) / 86400000,
				)
				device.entries.push({
					type: 'in',
					user_name: row.user_name,
					date: row.return_date,
					duration: `${days} day${days !== 1 ? 's' : ''}`,
				})
				device.entries.push({ type: 'out', user_name: row.user_name, date: row.checkout_date })
			} else {
				device.entries.push({
					type: 'out',
					user_name: row.user_name,
					date: row.checkout_date,
					ongoing: true,
				})
			}
		}

		res.render('transactions/history', {
			title: 'Asset History',
			devices: Array.from(deviceMap.values()),
		})
	} catch (err) {
		res.status(500).render('error', { message: 'Failed to load history', error: err.message })
	}
}
