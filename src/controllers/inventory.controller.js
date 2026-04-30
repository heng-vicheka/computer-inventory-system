// import { db } from '../db/db.ts'
// import { eq } from 'drizzle-orm/sqlite-core'
// import { devices, deviceTypes, deviceBrands, deviceStatuses } from '../db/schema.ts'
import inventoryMock from '../data/inventoryMock.js'

export const getInventory = (_req, res) => {
	const classMap = {
		Available: 'badge-available',
		'In-Use': 'badge-inuse',
		Maintenance: 'badge-maintenance',
		Retired: 'badge-retired',
	}

	// const rows = await db
	// 	.select({
	// 		id: devices.id,
	// 		serialNumber: devices.serialNumber,
	// 		modelName: devices.modelName,
	// 		brandName: deviceBrands.name,
	// 		typeName: deviceTypes.name,
	// 		statusName: deviceStatuses.name,
	// 		dateAcquired: devices.dateAcquired,
	// 		pictureUrl: devices.devicePictureUrl,
	// 	})
	// 	.from(devices)
	// 	.leftJoin(deviceBrands, eq(devices.deviceBrandId, deviceBrands.id))
	// 	.leftJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
	// 	.leftJoin(deviceStatuses, eq(devices.deviceStatusId, deviceStatuses.id))
	// 	.where(eq(devices.isDeleted, false))

	const defaultImage = '/images/device-placeholder.svg'
	const devices = inventoryMock.map((item) => ({
		...item,
		statusClass: classMap[item.status] ?? 'badge-retired',
		pictureUrl: item.pictureUrl?.trim() || defaultImage,
	}))

	res.render('inventory', {
		title: 'Inventory',
		devices,
	})
}
