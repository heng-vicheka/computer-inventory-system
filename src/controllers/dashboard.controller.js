import { getDashboardStats } from '../models/dashboard.model.js'

export const renderDashboard = async (req, res) => {
	try {
		const stats = await getDashboardStats()
		res.render('dashboard', { stats, title: 'Dashboard' })
	} catch (error) {
		// console.error('Error rendering dashboard:', error)
		res.status(500).render('error', {
			message: 'Failed to load dashboard',
			error: error.message,
		})
	}
}
