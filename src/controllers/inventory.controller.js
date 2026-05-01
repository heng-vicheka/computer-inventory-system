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

export const getDeviceCategories = async (_req, res) => {
	try {
		const rows = await db
			.select({
				id: deviceCategories.id,
				name: deviceCategories.name,
			})
			.from(deviceCategories)
			.orderBy(deviceCategories.name)

		return res.status(200).json({ deviceCategories: rows })
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to load device categories.', error: error.message })
	}
}

export const getDeviceStatuses = async (_req, res) => {
	try {
		const rows = await db
			.select({
				id: deviceStatuses.id,
				name: deviceStatuses.name,
			})
			.from(deviceStatuses)
			.orderBy(deviceStatuses.name)

		return res.status(200).json({ deviceStatuses: rows })
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to load device statuses.', error: error.message })
	}
}

export const createDevice = async (req, res) => {
	try {
		const { serialNumber, modelName, brand, category, status, dateAcquired, pictureUrl } = req.body

		const chosenCategory = String(category || '').trim()
		const chosenStatus = String(status || '').trim()
		if (
			!serialNumber?.trim() ||
			!modelName?.trim() ||
			!brand?.trim() ||
			!chosenCategory ||
			!chosenStatus
		) {
			return res
				.status(400)
				.json({ message: 'Serial number, model, brand, category, and status are required.' })
		}

		const normalizedStatus = chosenStatus.trim().replaceAll('-', ' ')
		const typeId = await getOrCreateByName(deviceTypes, chosenCategory)
		const brandId = await getOrCreateByName(deviceBrands, brand)
		const statusId = await getOrCreateByName(deviceStatuses, normalizedStatus)
		const categoryId = await getOrCreateByName(deviceCategories, chosenCategory)

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

export const updateDevice = async (req, res) => {
	try {
		const { id } = req.params
		if (!id) {
			return res.status(400).json({ message: 'Device id is required.' })
		}

		const { serialNumber, modelName, brand, category, status, dateAcquired, pictureUrl } = req.body
		const chosenCategory = String(category || '').trim()
		const chosenStatus = String(status || '').trim()
		if (
			!serialNumber?.trim() ||
			!modelName?.trim() ||
			!brand?.trim() ||
			!chosenCategory ||
			!chosenStatus
		) {
			return res
				.status(400)
				.json({ message: 'Serial number, model, brand, category, and status are required.' })
		}

		const [existing] = await db
			.select()
			.from(devices)
			.where(eq(devices.id, Number(id)))
			.limit(1)
		if (!existing) {
			return res.status(404).json({ message: 'Device not found.' })
		}

		const normalizedStatus = chosenStatus.trim().replaceAll('-', ' ')
		const typeId = await getOrCreateByName(deviceTypes, chosenCategory)
		const brandId = await getOrCreateByName(deviceBrands, brand)
		const statusId = await getOrCreateByName(deviceStatuses, normalizedStatus)
		const categoryId = await getOrCreateByName(deviceCategories, chosenCategory)

		if (!typeId || !brandId || !statusId || !categoryId) {
			return res.status(400).json({ message: 'Failed to resolve device metadata.' })
		}

		await db
			.update(devices)
			.set({
				serialNumber: serialNumber.trim(),
				modelName: modelName.trim(),
				deviceTypeId: typeId,
				deviceBrandId: brandId,
				deviceStatusId: statusId,
				deviceCategoryId: categoryId,
				devicePictureUrl: String(pictureUrl || '').trim() || existing.devicePictureUrl || null,
				dateAcquired: String(dateAcquired || '').trim() || null,
			})
			.where(eq(devices.id, Number(id)))

		return res.status(200).json({ message: 'Device updated successfully.' })
	} catch (error) {
		return res.status(500).json({ message: 'Failed to update device.', error: error.message })
	}
}

export const deleteDevice = async (req, res) => {
	try {
		const { id } = req.params
		if (!id) {
			return res.status(400).json({ message: 'Device id is required.' })
		}

		const [existing] = await db
			.select()
			.from(devices)
			.where(eq(devices.id, Number(id)))
			.limit(1)
		if (!existing) {
			return res.status(404).json({ message: 'Device not found.' })
		}

		await db
			.update(devices)
			.set({
				isDeleted: true,
				dateDeleted: new Date().toISOString(),
			})
			.where(eq(devices.id, Number(id)))

		return res.status(200).json({ message: 'Device deleted successfully.' })
	} catch (error) {
		return res.status(500).json({ message: 'Failed to delete device.', error: error.message })
	}
}
