import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

/* =========================
   USER ROLES
========================= */
export const userRoles = sqliteTable('user_roles', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
})

/* =========================
   USERS
========================= */
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	userRoleId: integer('user_role_id')
		.notNull()
		.references(() => userRoles.id),
	passwordHash: text('password_hash').notNull(),
	apiKeyHash: text('api_key_hash'),

	status: text('status').notNull(),
	profilePictureUrl: text('profile_picture_url'),
	dateCreated: text('date_created')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	dateUpdated: text('date_updated')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
	dateDeleted: text('date_deleted'),
})

/* =========================
   DEVICE TYPES
========================= */
export const deviceTypes = sqliteTable('device_types', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
})

/* =========================
   DEVICE BRANDS
========================= */
export const deviceBrands = sqliteTable('device_brands', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
})

/* =========================
   DEVICE STATUSES
========================= */
export const deviceStatuses = sqliteTable('device_statuses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
})

/* =========================
   DEVICE CATEGORIES
========================= */
export const deviceCategories = sqliteTable('device_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
})

/* =========================
   DEVICES
========================= */
export const devices = sqliteTable('devices', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	serialNumber: text('serial_number').notNull().unique(),

	deviceTypeId: integer('device_type_id')
		.notNull()
		.references(() => deviceTypes.id),

	deviceBrandId: integer('device_brand_id')
		.notNull()
		.references(() => deviceBrands.id),

	deviceStatusId: integer('device_status_id')
		.notNull()
		.references(() => deviceStatuses.id),

	deviceCategoryId: integer('device_category_id')
		.notNull()
		.references(() => deviceCategories.id),

	devicePictureUrl: text('device_picture_url'),

	modelName: text('model_name'),
	dateAcquired: text('date_acquired'),

	dateCreated: text('date_created')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	dateUpdated: text('date_updated')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
	dateDeleted: text('date_deleted'),
})

/* =========================
   HISTORY
========================= */
export const history = sqliteTable('history', {
	id: integer('id').primaryKey({ autoIncrement: true }),

	deviceId: integer('device_id')
		.notNull()
		.references(() => devices.id),

	userId: integer('user_id')
		.notNull()
		.references(() => users.id),

	dateCheckedIn: text('date_checked_in').notNull(),
	dateCheckedOut: text('date_checked_out'),

	isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
	dateDeleted: text('date_deleted'),
})

/* =========================
   USERS RELATIONS
========================= */
export const usersRelations = relations(users, ({ one, many }) => ({
	role: one(userRoles, {
		fields: [users.userRoleId],
		references: [userRoles.id],
	}),
	history: many(history),
}))

/* =========================
    DEVICES RELATIONS
========================= */
export const devicesRelations = relations(devices, ({ one, many }) => ({
	type: one(deviceTypes, {
		fields: [devices.deviceTypeId],
		references: [deviceTypes.id],
	}),
	brand: one(deviceBrands, {
		fields: [devices.deviceBrandId],
		references: [deviceBrands.id],
	}),
	status: one(deviceStatuses, {
		fields: [devices.deviceStatusId],
		references: [deviceStatuses.id],
	}),
	category: one(deviceCategories, {
		fields: [devices.deviceCategoryId],
		references: [deviceCategories.id],
	}),
	history: many(history),
}))

/* =========================
   HISTORY RELATIONS
========================= */
export const historyRelations = relations(history, ({ one }) => ({
	device: one(devices, {
		fields: [history.deviceId],
		references: [devices.id],
	}),
	user: one(users, {
		fields: [history.userId],
		references: [users.id],
	}),
}))
