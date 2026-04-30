import { Router } from 'express'
import { renderDashboard } from '../controllers/dashboardController.js'
import { renderHistory } from '../controllers/historyController.js'

const clientRouter = Router()

clientRouter.get('/', renderDashboard)
clientRouter.get('/history', renderHistory)

export default clientRouter
