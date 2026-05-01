import { getDashboardStats, getRecentActivity } from '../models/dashboard.model.js'

export const renderDashboard = async (_req, res) => {
	try {
		const [stats, recentActivity] = await Promise.all([getDashboardStats(), getRecentActivity()])
		res.render('dashboard', { stats, recentActivity, title: 'Dashboard' })
	} catch (error) {
		res.status(500).render('error', { message: 'Failed to load dashboard', error: error.message })
	}
}
