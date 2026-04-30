import { getHistoryBySerialNumber } from '../models/historyModel.js'

export const renderHistory = async (req, res) => {
	try {
		const serialNumber = req.query.search || ''
		const groupedHistory = await getHistoryBySerialNumber(serialNumber)

		res.render('history', { groupedHistory, searchQuery: serialNumber, title: 'Asset History' })
	} catch (error) {
		// console.error('Error rendering history:', error)
		res.status(500).render('error', {
			message: 'Failed to load history',
			error: error.message,
		})
	}
}
