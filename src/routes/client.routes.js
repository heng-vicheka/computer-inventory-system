import { Router } from 'express'
import { renderDashboard } from '../controllers/dashboardController.js'
import { renderHistory } from '../controllers/historyController.js'
import { renderUsers, renderNewUser, renderEditUser } from '../controllers/userController.js'
import {
	renderTransactions,
	renderTransactionHistory,
} from '../controllers/transactionController.js'

const clientRouter = Router()

clientRouter.get('/', (_req, res) => res.redirect('/dashboard'))
clientRouter.get('/dashboard', renderDashboard)
clientRouter.get('/history', renderHistory)

clientRouter.get('/users', renderUsers)
clientRouter.get('/users/new', renderNewUser)
clientRouter.get('/users/:id/edit', renderEditUser)

clientRouter.get('/transactions', renderTransactions)
clientRouter.get('/transactions/history', renderTransactionHistory)

export default clientRouter
