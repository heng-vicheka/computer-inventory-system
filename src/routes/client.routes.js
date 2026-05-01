import { Router } from 'express'
import { renderDashboard } from '../controllers/dashboardController.js'
import { getInventory } from '../controllers/inventory.controller.js'
import authRouter from './authRoutes.js'

const clientRouter = Router()

clientRouter.use('/', authRouter)

// ─── Dashboard Routes ──────────────────────────────────────────────────────────────────
clientRouter.get('/', (req, res) => {
	res.redirect('/dashboard')
})

clientRouter.get('/dashboard', renderDashboard)

// ─── Inventory Routes ──────────────────────────────────────────────────────────────────
clientRouter.get('/inventory', getInventory)

export default clientRouter
