import { db } from '../db/db.js'
import { devices, deviceStatuses, history, users } from '../db/schema.js'
import { eq, count, desc } from 'drizzle-orm'

export const getDashboardStats = async () => {
	const [{ total }] = await db.select({ total: count() }).from(devices).where(eq(devices.isDeleted, false))

	const byStatus = await db
		.select({ statusName: deviceStatuses.name, statusCount: count() })
		.from(devices)
		.innerJoin(deviceStatuses, eq(devices.deviceStatusId, deviceStatuses.id))
		.where(eq(devices.isDeleted, false))
		.groupBy(deviceStatuses.id, deviceStatuses.name)

	const stats = { total, available: 0, inUse: 0, maintenance: 0, retired: 0 }
	byStatus.forEach(({ statusName, statusCount }) => {
		if (statusName === 'Available') stats.available = statusCount
		else if (statusName === 'In-Use' || statusName === 'In Use') stats.inUse = statusCount
		else if (statusName === 'Maintenance') stats.maintenance = statusCount
		else if (statusName === 'Retired') stats.retired = statusCount
	})

	return stats
}

export const getRecentActivity = async (limit = 6) => {
	const rows = await db
		.select({
			id: history.id,
			userName: users.name,
			serialNumber: devices.serialNumber,
			modelName: devices.modelName,
			dateCheckedIn: history.dateCheckedIn,
			dateCheckedOut: history.dateCheckedOut,
		})
		.from(history)
		.innerJoin(devices, eq(history.deviceId, devices.id))
		.innerJoin(users, eq(history.userId, users.id))
		.orderBy(desc(history.id))
		.limit(limit)

	return rows.map((r) => {
		const hasReturn = !!r.dateCheckedOut
		const date = hasReturn
			? r.dateCheckedOut.split('T')[0]
			: r.dateCheckedIn.split('T')[0]
		const label = r.modelName ? `${r.serialNumber} (${r.modelName})` : r.serialNumber

		return {
			description: hasReturn
				? `${label} checked in from ${r.userName}`
				: `${label} checked out to ${r.userName}`,
			date,
			dotClass: hasReturn ? 'green' : '',
		}
	})
}
