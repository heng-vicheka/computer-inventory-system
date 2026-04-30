import { Router } from 'express'
import { renderDashboard } from '../controllers/dashboardController.js'
import { getInventory } from '../controllers/inventory.controller.js'
import { renderHistory } from '../controllers/historyController.js'

const clientRouter = Router()

// ─── Dashboard Routes ──────────────────────────────────────────────────────────────────
clientRouter.get('/', (req, res) => {
	res.redirect('/dashboard')
})

clientRouter.get('/dashboard', renderDashboard)

// ─── Inventory Routes ──────────────────────────────────────────────────────────────────
clientRouter.get('/inventory', getInventory)
clientRouter.get('/history', renderHistory)

export default clientRouter
