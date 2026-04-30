import { Router } from 'express'
import { getItems, createDevice } from '../controllers/inventory.controller.js'

const apiRouter = Router()

function notImplemented(req, res) {
	return res.status(501).json({
		message: 'Endpoint scaffolded. Implementation pending.',
		method: req.method,
		path: req.originalUrl,
	})
}

apiRouter.post('/auth/login', notImplemented)

apiRouter.post('/users', notImplemented)
apiRouter.patch('/users/:id/role', notImplemented)
apiRouter.patch('/users/:id/status', notImplemented)

apiRouter.post('/keys', notImplemented)
apiRouter.get('/keys', notImplemented)
apiRouter.delete('/keys/:id', notImplemented)

apiRouter.get('/items', getItems)
apiRouter.get('/items/:id/history', notImplemented)
apiRouter.post('/items', createDevice)
apiRouter.put('/items/:id', notImplemented)
apiRouter.delete('/items/:id', notImplemented)

apiRouter.post('/transactions/checkout', notImplemented)
apiRouter.post('/transactions/checkin', notImplemented)

apiRouter.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' })
})

export default apiRouter
