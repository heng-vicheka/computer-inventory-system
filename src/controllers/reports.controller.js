import { eq, and, lt, isNull } from 'drizzle-orm'
import { db } from '../db/db.js'
import { devices, deviceStatuses, deviceBrands, deviceTypes, history, users } from '../db/schema.js'

function threeYearsAgo() {
	const d = new Date()
	d.setFullYear(d.getFullYear() - 3)
	return d.toISOString().split('T')[0]
}

export const renderReports = async (_req, res) => {
	try {
		const cutoff = threeYearsAgo()

		const [allDevices, agingRows, inUseDevices, allUsers] = await Promise.all([
			db.select({ id: devices.id }).from(devices).where(eq(devices.isDeleted, false)),

			db
				.select({
					serialNumber: devices.serialNumber,
					modelName: devices.modelName,
					brandName: deviceBrands.name,
					dateAcquired: devices.dateAcquired,
					statusName: deviceStatuses.name,
				})
				.from(devices)
				.leftJoin(deviceStatuses, eq(devices.deviceStatusId, deviceStatuses.id))
				.leftJoin(deviceBrands, eq(devices.deviceBrandId, deviceBrands.id))
				.where(and(eq(devices.isDeleted, false), lt(devices.dateAcquired, cutoff)))
				.orderBy(devices.dateAcquired),

			db
				.select({ id: devices.id })
				.from(devices)
				.leftJoin(deviceStatuses, eq(devices.deviceStatusId, deviceStatuses.id))
				.where(and(eq(devices.isDeleted, false), eq(deviceStatuses.name, 'In-Use'))),

			db
				.select({ id: users.id, name: users.name })
				.from(users)
				.where(and(eq(users.isDeleted, false), eq(users.status, 'active')))
				.orderBy(users.name),
		])

		const now = new Date()
		const agingAssets = agingRows.map((r) => {
			const acquired = r.dateAcquired ? new Date(r.dateAcquired) : null
			const agingYears = acquired ? Math.floor((now - acquired) / (365.25 * 86400000)) : null
			const statusName = r.statusName || 'Unknown'
			const statusClass =
				statusName === 'Available' ? 'badge-available' :
				statusName === 'In-Use' ? 'badge-inuse' :
				statusName === 'Maintenance' ? 'badge-maintenance' : 'badge-retired'
			return {
				serialNumber: r.serialNumber,
				modelName: r.modelName || '—',
				brandName: r.brandName || '—',
				dateAcquired: r.dateAcquired || '—',
				ageLabel: agingYears !== null ? `${agingYears} yr${agingYears !== 1 ? 's' : ''}` : '—',
				statusName,
				statusClass,
			}
		})

		const stats = {
			total: allDevices.length,
			deployed: inUseDevices.length,
			aging: agingAssets.length,
		}

		res.render('reports', { title: 'Reports', stats, agingAssets, allUsers })
	} catch (error) {
		res.status(500).render('error', { message: 'Failed to load reports', error: error.message })
	}
}

export const getUserAssets = async (req, res) => {
	const userId = Number(req.query.userId)
	if (!userId) return res.status(400).json({ message: 'userId is required.' })

	const rows = await db
		.select({
			serialNumber: devices.serialNumber,
			modelName: devices.modelName,
			dateCheckedIn: history.dateCheckedIn,
		})
		.from(history)
		.innerJoin(devices, eq(history.deviceId, devices.id))
		.where(and(eq(history.userId, userId), isNull(history.dateCheckedOut), eq(history.isDeleted, false)))

	return res.status(200).json({ assets: rows })
}
