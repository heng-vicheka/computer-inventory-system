import { eq, isNull, and } from 'drizzle-orm'
import { db } from '../db/db.js'
import { devices, deviceStatuses, deviceTypes, deviceBrands, history, users, userRoles } from '../db/schema.js'

async function getStatusId(name) {
	const [row] = await db
		.select({ id: deviceStatuses.id })
		.from(deviceStatuses)
		.where(eq(deviceStatuses.name, name))
		.limit(1)
	return row?.id ?? null
}

export const renderCheckout = async (_req, res) => {
	try {
		const [availableId, inUseId] = await Promise.all([getStatusId('Available'), getStatusId('In-Use')])

		const [availableDevices, inUseDevices, allUsers] = await Promise.all([
			db
				.select({
					id: devices.id,
					serialNumber: devices.serialNumber,
					modelName: devices.modelName,
				})
				.from(devices)
				.where(and(eq(devices.deviceStatusId, availableId), eq(devices.isDeleted, false))),

			db
				.select({
					id: devices.id,
					serialNumber: devices.serialNumber,
					modelName: devices.modelName,
				})
				.from(devices)
				.where(and(eq(devices.deviceStatusId, inUseId), eq(devices.isDeleted, false))),

			db
				.select({ id: users.id, name: users.name })
				.from(users)
				.where(and(eq(users.status, 'active'), eq(users.isDeleted, false)))
				.orderBy(users.name),
		])

		res.render('checkout', { title: 'Check-in / Out', availableDevices, inUseDevices, allUsers })
	} catch (error) {
		res.status(500).render('error', { message: 'Failed to load checkout page', error: error.message })
	}
}

export const handleCheckout = async (req, res) => {
	const { deviceId, userId } = req.body || {}

	if (!deviceId || !userId) {
		return res.status(400).json({ message: 'deviceId and userId are required.' })
	}

	const [device] = await db
		.select({ id: devices.id, statusId: devices.deviceStatusId })
		.from(devices)
		.where(and(eq(devices.id, Number(deviceId)), eq(devices.isDeleted, false)))
		.limit(1)

	if (!device) return res.status(404).json({ message: 'Device not found.' })

	const [statusRow] = await db
		.select({ name: deviceStatuses.name })
		.from(deviceStatuses)
		.where(eq(deviceStatuses.id, device.statusId))
		.limit(1)

	const statusName = statusRow?.name || ''
	if (statusName === 'Maintenance' || statusName === 'Retired') {
		return res.status(400).json({ message: `Cannot check out a device with status "${statusName}".` })
	}
	if (statusName !== 'Available') {
		return res.status(400).json({ message: 'Device is not available for checkout.' })
	}

	const inUseId = await getStatusId('In-Use')
	const now = new Date().toISOString()

	await db.insert(history).values({
		deviceId: Number(deviceId),
		userId: Number(userId),
		dateCheckedIn: now,
	})

	await db
		.update(devices)
		.set({ deviceStatusId: inUseId, dateUpdated: now })
		.where(eq(devices.id, Number(deviceId)))

	return res.status(200).json({ message: 'Device checked out successfully.' })
}

export const handleCheckin = async (req, res) => {
	const { deviceId } = req.body || {}

	if (!deviceId) return res.status(400).json({ message: 'deviceId is required.' })

	const [openRecord] = await db
		.select({ id: history.id })
		.from(history)
		.where(and(eq(history.deviceId, Number(deviceId)), isNull(history.dateCheckedOut), eq(history.isDeleted, false)))
		.limit(1)

	if (!openRecord) return res.status(404).json({ message: 'No open checkout record found for this device.' })

	const availableId = await getStatusId('Available')
	const now = new Date().toISOString()

	await db.update(history).set({ dateCheckedOut: now }).where(eq(history.id, openRecord.id))

	await db
		.update(devices)
		.set({ deviceStatusId: availableId, dateUpdated: now })
		.where(eq(devices.id, Number(deviceId)))

	return res.status(200).json({ message: 'Device checked in successfully.' })
}

export const getItemHistory = async (req, res) => {
	const deviceId = Number(req.params.id)

	const rows = await db
		.select({
			id: history.id,
			userName: users.name,
			dateCheckedIn: history.dateCheckedIn,
			dateCheckedOut: history.dateCheckedOut,
		})
		.from(history)
		.innerJoin(users, eq(history.userId, users.id))
		.where(and(eq(history.deviceId, deviceId), eq(history.isDeleted, false)))
		.orderBy(history.id)

	const records = rows.map((r) => {
		const checkedOut = r.dateCheckedOut ? new Date(r.dateCheckedOut) : null
		const checkedIn = new Date(r.dateCheckedIn)
		const durationDays = checkedOut ? Math.floor((checkedOut - checkedIn) / 86400000) : null

		return {
			id: r.id,
			userName: r.userName,
			dateCheckedIn: r.dateCheckedIn.split('T')[0],
			dateCheckedOut: checkedOut ? r.dateCheckedOut.split('T')[0] : null,
			duration: durationDays !== null ? `${durationDays} days` : 'ongoing',
		}
	})

	return res.status(200).json({ history: records })
}
