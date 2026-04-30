import { db } from '../db/db.js'
import { eq } from 'drizzle-orm'
import {
	devices,
	deviceBrands,
	deviceTypes,
	deviceStatuses,
	deviceCategories,
} from '../db/schema.js'

async function getOrCreateByName(table, value) {
	const name = String(value || '').trim()
	if (!name) return null

	const [existing] = await db.select().from(table).where(eq(table.name, name)).limit(1)
	if (existing) {
		return existing.id
	}

	await db.insert(table).values({ name })
	const [created] = await db.select().from(table).where(eq(table.name, name)).limit(1)
	return created?.id ?? null
}

const statusClassMap = {
	Available: 'badge-available',
	'In Use': 'badge-inuse',
	Maintenance: 'badge-maintenance',
	Retired: 'badge-retired',
}

export const getInventory = async (_req, res) => {
	const rows = await db
		.select({
			id: devices.id,
			serialNumber: devices.serialNumber,
			modelName: devices.modelName,
			brand: deviceBrands.name,
			type: deviceTypes.name,
			status: deviceStatuses.name,
			category: deviceCategories.name,
			pictureUrl: devices.devicePictureUrl,
			dateAcquired: devices.dateAcquired,
		})
		.from(devices)
		.leftJoin(deviceBrands, eq(devices.deviceBrandId, deviceBrands.id))
		.leftJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
		.leftJoin(deviceStatuses, eq(devices.deviceStatusId, deviceStatuses.id))
		.leftJoin(deviceCategories, eq(devices.deviceCategoryId, deviceCategories.id))
		.where(eq(devices.isDeleted, false))

	const defaultImage = '/images/device-placeholder.svg'
	const devicesList = rows.map((item) => ({
		...item,
		statusClass: statusClassMap[item.status] ?? 'badge-available',
		pictureUrl: item.pictureUrl?.trim() || defaultImage,
	}))

	res.render('inventory', {
		title: 'Inventory',
		devices: devicesList,
	})
}

export const getItems = async (_req, res) => {
	try {
		const rows = await db
			.select({
				id: devices.id,
				serialNumber: devices.serialNumber,
				modelName: devices.modelName,
				brand: deviceBrands.name,
				type: deviceTypes.name,
				status: deviceStatuses.name,
				category: deviceCategories.name,
				pictureUrl: devices.devicePictureUrl,
				dateAcquired: devices.dateAcquired,
			})
			.from(devices)
			.leftJoin(deviceBrands, eq(devices.deviceBrandId, deviceBrands.id))
			.leftJoin(deviceTypes, eq(devices.deviceTypeId, deviceTypes.id))
			.leftJoin(deviceStatuses, eq(devices.deviceStatusId, deviceStatuses.id))
			.leftJoin(deviceCategories, eq(devices.deviceCategoryId, deviceCategories.id))
			.where(eq(devices.isDeleted, false))

		const devicesList = rows.map((item) => ({
			...item,
			statusClass: statusClassMap[item.status] ?? 'badge-available',
			pictureUrl: item.pictureUrl?.trim() || '/images/device-placeholder.svg',
		}))

		return res.status(200).json({ devices: devicesList })
	} catch (error) {
		return res.status(500).json({ message: 'Failed to load devices.', error: error.message })
	}
}

export const createDevice = async (req, res) => {
	try {
		const { serialNumber, modelName, brand, type, category, status, dateAcquired, pictureUrl } =
			req.body

		if (!serialNumber?.trim() || !modelName?.trim() || !brand?.trim()) {
			return res.status(400).json({ message: 'Serial number, model, and brand are required.' })
		}

		const normalizedStatus = String(status || 'Available')
			.trim()
			.replaceAll('-', ' ')
		const typeId = await getOrCreateByName(deviceTypes, type || category || 'Unknown')
		const brandId = await getOrCreateByName(deviceBrands, brand)
		const statusId = await getOrCreateByName(deviceStatuses, normalizedStatus)
		const categoryId = await getOrCreateByName(deviceCategories, category || type || 'Unspecified')

		if (!typeId || !brandId || !statusId || !categoryId) {
			return res.status(400).json({ message: 'Failed to resolve device metadata.' })
		}

		await db.insert(devices).values({
			serialNumber: serialNumber.trim(),
			modelName: modelName.trim(),
			deviceTypeId: typeId,
			deviceBrandId: brandId,
			deviceStatusId: statusId,
			deviceCategoryId: categoryId,
			devicePictureUrl: String(pictureUrl || '').trim() || null,
			dateAcquired: String(dateAcquired || '').trim() || null,
		})

		return res.status(201).json({ message: 'Device created successfully.' })
	} catch (error) {
		return res.status(500).json({ message: 'Failed to create device.', error: error.message })
	}
}
