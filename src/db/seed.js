import 'dotenv/config'
import { db } from './db.js'
import {
	deviceBrands,
	deviceCategories,
	deviceStatuses,
	deviceTypes,
	history,
	userRoles,
	users,
	devices,
} from './schema.js'

async function main() {
	const existingSeed = await db.select().from(userRoles).limit(1)
	if (existingSeed.length > 0) {
		// console.log('Seed data already exists. Skipping seeding.')
		return
	}

	await db.insert(userRoles).values([
		{ id: 1, name: 'Admin' },
		{ id: 2, name: 'Staff' },
		{ id: 3, name: 'Guest' },
	])

	await db.insert(deviceTypes).values([
		{ id: 1, name: 'Laptop' },
		{ id: 2, name: 'Desktop' },
		{ id: 3, name: 'Tablet' },
		{ id: 4, name: 'Monitor' },
	])

	await db.insert(deviceBrands).values([
		{ id: 1, name: 'Apple' },
		{ id: 2, name: 'Dell' },
		{ id: 3, name: 'HP' },
		{ id: 4, name: 'Lenovo' },
	])

	await db.insert(deviceStatuses).values([
		{ id: 1, name: 'Available' },
		{ id: 2, name: 'In-Use' },
		{ id: 3, name: 'Maintenance' },
		{ id: 4, name: 'Retired' },
	])

	await db.insert(deviceCategories).values([
		{ id: 1, name: 'Workstation' },
		{ id: 2, name: 'Peripheral' },
		{ id: 3, name: 'Mobile' },
		{ id: 4, name: 'Server' },
	])

	await db.insert(users).values([
		{
			id: 1,
			name: 'Seng Mouyheang',
			email: 'seng.m@example.com',
			userRoleId: 1,
			status: 'active',
			profilePictureUrl: 'https://example.com/profiles/seng.jpg',
		},
		{
			id: 2,
			name: 'Heng Vicheka',
			email: 'heng.v@example.com',
			userRoleId: 2,
			status: 'active',
			profilePictureUrl: 'https://example.com/profiles/vicheka.jpg',
		},
		{
			id: 3,
			name: 'Heng Chanpheakdey',
			email: 'heng.c@example.com',
			userRoleId: 3,
			status: 'inactive',
		},
	])

	await db.insert(devices).values([
		{
			id: 1,
			serialNumber: 'SN-APL-001',
			deviceTypeId: 1,
			deviceBrandId: 1,
			deviceStatusId: 2,
			deviceCategoryId: 1,
			devicePictureUrl: 'https://example.com/devices/macbook-pro.jpg',
			modelName: 'MacBook Pro 16',
			dateAcquired: '2024-07-01',
		},
		{
			id: 2,
			serialNumber: 'SN-DEL-002',
			deviceTypeId: 2,
			deviceBrandId: 2,
			deviceStatusId: 1,
			deviceCategoryId: 1,
			devicePictureUrl: 'https://example.com/devices/dell-optiplex.jpg',
			modelName: 'OptiPlex 7090',
			dateAcquired: '2023-11-10',
		},
		{
			id: 3,
			serialNumber: 'SN-HPP-003',
			deviceTypeId: 3,
			deviceBrandId: 3,
			deviceStatusId: 1,
			deviceCategoryId: 3,
			modelName: 'HP Elite x2',
			dateAcquired: '2024-01-18',
		},
		{
			id: 4,
			serialNumber: 'SN-LNV-004',
			deviceTypeId: 4,
			deviceBrandId: 4,
			deviceStatusId: 3,
			deviceCategoryId: 2,
			modelName: 'ThinkVision P24h',
			dateAcquired: '2023-08-22',
		},
	])

	await db.insert(history).values([
		{
			id: 1,
			deviceId: 1,
			userId: 2,
			dateCheckedIn: '2025-03-01T09:00:00Z',
			dateCheckedOut: '2025-03-07T17:30:00Z',
		},
		{
			id: 2,
			deviceId: 2,
			userId: 1,
			dateCheckedIn: '2024-12-05T08:30:00Z',
		},
	])

	// console.log('Seed data inserted successfully.')
}

main().catch(() => {
	// console.error('Failed to seed database:', error)
	process.exit(1)
})
