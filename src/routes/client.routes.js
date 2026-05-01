import { Router } from 'express'
import { renderDashboard } from '../controllers/dashboardController.js'
import { getInventory } from '../controllers/inventory.controller.js'
import { renderHistory } from '../controllers/historyController.js'
import { renderUsers, renderNewUser, renderEditUser } from '../controllers/userController.js'
import {
	renderTransactions,
	renderTransactionHistory,
} from '../controllers/transactionController.js'

const clientRouter = Router()

// ─── Dashboard Routes ──────────────────────────────────────────────────────────────────
clientRouter.get('/', (req, res) => {
	res.redirect('/dashboard')
})

clientRouter.get('/dashboard', renderDashboard)

// ─── Inventory Routes ──────────────────────────────────────────────────────────────────
clientRouter.get('/inventory', getInventory)
clientRouter.get('/history', renderHistory)

clientRouter.get('/users', renderUsers)
clientRouter.get('/users/new', renderNewUser)
clientRouter.get('/users/:id/edit', renderEditUser)

clientRouter.get('/transactions', renderTransactions)
clientRouter.get('/transactions/history', renderTransactionHistory)

export default clientRouter
