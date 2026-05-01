import { Router } from 'express'
import { renderHistory } from '../controllers/historyController.js'
import { renderApiKeys } from '../controllers/apiKey.controller.js'
import { renderDashboard } from '../controllers/dashboard.controller.js'
import { getInventory } from '../controllers/inventory.controller.js'
import { renderUsers } from '../controllers/users.controller.js'
import { renderCheckout } from '../controllers/checkout.controller.js'
import { renderReports } from '../controllers/reports.controller.js'
import { verifyJwt } from '../utils/jwt.js'
import { getCookieValue } from '../utils/cookies.js'
import authRouter from './authRoutes.js'

const clientRouter = Router()

clientRouter.use('/', authRouter)

function requireAdminPage(req, res, next) {
	try {
		const token = getCookieValue(req.headers.cookie, 'auth_token')
		const payload = verifyJwt(token)
		if (payload.role !== 'Admin') return res.redirect('/dashboard')
		return next()
	} catch {
		return res.redirect('/login')
	}
}

clientRouter.get('/', (_req, res) => res.redirect('/dashboard'))
clientRouter.get('/dashboard', renderDashboard)
clientRouter.get('/history', renderHistory)
clientRouter.get('/inventory', getInventory)
clientRouter.get('/checkout', renderCheckout)
clientRouter.get('/reports', renderReports)
clientRouter.get('/users', requireAdminPage, renderUsers)
clientRouter.get('/apikeys', requireAdminPage, renderApiKeys)

export default clientRouter
