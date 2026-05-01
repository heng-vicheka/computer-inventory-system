import { Router } from 'express'
import { getItems, createDevice, updateDevice, deleteDevice, getDeviceCategories, getDeviceStatuses } from '../controllers/inventory.controller.js'
import { uploadImage } from '../controllers/upload.controller.js'
import { generateApiKey, listApiKeys, revokeApiKeyById } from '../controllers/apiKey.controller.js'
import { handleApiLogin } from '../controllers/authController.js'
import { createUser, updateUserRole, updateUserStatus } from '../controllers/users.controller.js'
import { handleCheckout, handleCheckin, getItemHistory } from '../controllers/checkout.controller.js'
import { getUserAssets } from '../controllers/reports.controller.js'
import { authenticateApiJwt, requireAdmin, authenticateApiKeyOrJwt } from '../middlewares/auth.middleware.js'

const apiRouter = Router()

apiRouter.post('/auth/login', handleApiLogin)
apiRouter.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))

apiRouter.use(authenticateApiJwt)

// Users (Admin only)
apiRouter.post('/users', requireAdmin, createUser)
apiRouter.patch('/users/:id/role', requireAdmin, updateUserRole)
apiRouter.patch('/users/:id/status', requireAdmin, updateUserStatus)

// API Keys (Admin only)
apiRouter.post('/keys', requireAdmin, generateApiKey)
apiRouter.get('/keys', requireAdmin, listApiKeys)
apiRouter.delete('/keys/:id', requireAdmin, revokeApiKeyById)

// Inventory helpers (JWT only — called from UI, ahead of the JWT-or-key gate)
apiRouter.post('/items/upload', uploadImage)
apiRouter.get('/items/device-categories', getDeviceCategories)
apiRouter.get('/items/device-statuses', getDeviceStatuses)

// Items (GET accepts JWT or API key; write ops require JWT)
apiRouter.get('/items', authenticateApiKeyOrJwt, getItems)
apiRouter.get('/items/:id/history', getItemHistory)
apiRouter.post('/items', createDevice)
apiRouter.put('/items/:id', updateDevice)
apiRouter.delete('/items/:id', requireAdmin, deleteDevice)

// Transactions
apiRouter.post('/transactions/checkout', handleCheckout)
apiRouter.post('/transactions/checkin', handleCheckin)

// Reports
apiRouter.get('/reports/user-assets', getUserAssets)

export default apiRouter
