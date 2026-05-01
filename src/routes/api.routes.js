import { Router } from 'express'
import {
	getItems,
	createDevice,
	updateDevice,
	deleteDevice,
	getDeviceCategories,
	getDeviceStatuses,
} from '../controllers/inventory.controller.js'
import { uploadImage } from '../controllers/upload.controller.js'
import { handleApiLogin } from '../controllers/authController.js'
import { authenticateApiJwt } from '../middlewares/auth.middleware.js'

const apiRouter = Router()

function notImplemented(req, res) {
	return res.status(501).json({
		message: 'Endpoint scaffolded. Implementation pending.',
		method: req.method,
		path: req.originalUrl,
	})
}

apiRouter.post('/auth/login', handleApiLogin)
apiRouter.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' })
})

apiRouter.use(authenticateApiJwt)

apiRouter.post('/users', notImplemented)
apiRouter.patch('/users/:id/role', notImplemented)
apiRouter.patch('/users/:id/status', notImplemented)

apiRouter.post('/keys', notImplemented)
apiRouter.get('/keys', notImplemented)
apiRouter.delete('/keys/:id', notImplemented)

apiRouter.post('/items/upload', uploadImage)
apiRouter.get('/items/device-categories', getDeviceCategories)
apiRouter.get('/items/device-statuses', getDeviceStatuses)
apiRouter.get('/items', getItems)
apiRouter.get('/items/:id/history', notImplemented)
apiRouter.post('/items', createDevice)
apiRouter.put('/items/:id', updateDevice)
apiRouter.delete('/items/:id', deleteDevice)

apiRouter.post('/transactions/checkout', notImplemented)
apiRouter.post('/transactions/checkin', notImplemented)

export default apiRouter
