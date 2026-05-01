import { Router } from 'express'
import { renderDashboard } from '../controllers/dashboardController.js'
import { renderHistory } from '../controllers/historyController.js'

const clientRouter = Router()

clientRouter.get('/', (_req, res) => res.redirect('/dashboard'))
clientRouter.get('/dashboard', renderDashboard)
clientRouter.get('/history', renderHistory)

export default clientRouter
