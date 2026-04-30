import { db } from '../db/db.js'
import { history, devices, users } from '../db/schema.js'
import { eq, asc } from 'drizzle-orm'

export const getHistoryBySerialNumber = async (serialNumber) => {
	try {
		let query = db
			.select({
				id: history.id,
				userName: users.name,
				serialNumber: devices.serialNumber,
				modelName: devices.modelName,
				dateCheckedOut: history.dateCheckedOut,
				dateCheckedIn: history.dateCheckedIn,
			})
			.from(history)
			.innerJoin(devices, eq(history.deviceId, devices.id))
			.innerJoin(users, eq(history.userId, users.id))

		// Apply serial number filter if provided
		if (serialNumber?.trim()) {
			query = query.where(eq(devices.serialNumber, serialNumber.trim().toUpperCase()))
		}

		const results = await query.orderBy(asc(history.id))

		// Calculate duration for each record
		const historyData = results.map((record) => {
			let duration = 'ongoing'
			let displayDate = ''
			let eventType = 'checked-out'

			// Format dates to YYYY-MM-DD
			const dateCheckedInFormatted = record.dateCheckedIn
				? record.dateCheckedIn.split('T')[0]
				: null
			const dateCheckedOutFormatted = record.dateCheckedOut
				? record.dateCheckedOut.split('T')[0]
				: null

			// If we have both dates, calculate duration and show as completed
			if (dateCheckedInFormatted && dateCheckedOutFormatted) {
				const checkedIn = new Date(dateCheckedInFormatted)
				const checkedOut = new Date(dateCheckedOutFormatted)
				const durationMs = checkedOut.getTime() - checkedIn.getTime()
				const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24))
				duration = `${durationDays} days`
				displayDate = dateCheckedOutFormatted
				eventType = 'checked-in'
			} else if (dateCheckedInFormatted) {
				// Only checkout date
				displayDate = dateCheckedInFormatted
				eventType = 'checked-out'
				duration = 'ongoing'
			}

			return {
				...record,
				duration,
				displayDate,
				eventType,
				dateCheckedInFormatted,
				dateCheckedOutFormatted,
			}
		})

		// Group by device serial number with model name
		const groupedHistory = {}
		historyData.forEach((record) => {
			const key = `${record.serialNumber} — ${record.modelName || 'Unknown'}`
			if (!groupedHistory[key]) {
				groupedHistory[key] = []
			}
			groupedHistory[key].push(record)
		})

		return groupedHistory
	} catch (error) {
		// console.error('Error fetching history:', error)
		throw new Error(error.message, { cause: error })
	}
}
