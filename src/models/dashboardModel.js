import { db } from '../db/db.js'
import { devices, deviceStatuses } from '../db/schema.js'
import { eq, count } from 'drizzle-orm'

export const getDashboardStats = async () => {
	try {
		// Get total count of all devices
		const totalDevices = await db.select({ count: count() }).from(devices)

		// Get count of devices by status
		const devicesByStatus = await db
			.select({
				statusName: deviceStatuses.name,
				statusCount: count(),
			})
			.from(devices)
			.innerJoin(deviceStatuses, eq(devices.deviceStatusId, deviceStatuses.id))
			.groupBy(deviceStatuses.id, deviceStatuses.name)

		// Format the response
		const stats = {
			total: totalDevices[0]?.count || 0,
			available: 0,
			inUse: 0,
			maintenance: 0,
			retired: 0,
		}

		// Map status counts to the stats object
		devicesByStatus.forEach((item) => {
			if (item.statusName === 'Available') {
				stats.available = item.statusCount
			} else if (item.statusName === 'In Use') {
				stats.inUse = item.statusCount
			} else if (item.statusName === 'Maintenance') {
				stats.maintenance = item.statusCount
			} else if (item.statusName === 'Retired') {
				stats.retired = item.statusCount
			}
		})

		return stats
	} catch (error) {
		// console.error('Error fetching dashboard stats:', error)
		throw new Error(error.message, { cause: error })
	}
}
