import { getUsers, getUserById, getUserRoles } from '../models/userModel.js'

export const renderUsers = async (req, res) => {
	try {
		const users = await getUsers()
		const active = users.filter((u) => u.status === 'active').length
		const stats = { total: users.length, active, inactive: users.length - active }
		let flash = null
		if (req.query.created) flash = { type: 'success', message: 'User created successfully.' }
		else if (req.query.updated) flash = { type: 'success', message: 'User updated successfully.' }
		else if (req.query.deleted) flash = { type: 'warning', message: 'User deleted.' }
		res.render('users/index', { title: 'Users', users, stats, flash })
	} catch (err) {
		res.status(500).render('error', { message: 'Failed to load users', error: err.message })
	}
}

export const renderNewUser = async (_req, res) => {
	try {
		const roles = await getUserRoles()
		res.render('users/new', { title: 'Create User', roles })
	} catch (err) {
		res.status(500).render('error', { message: 'Failed to load form', error: err.message })
	}
}

export const renderEditUser = async (req, res) => {
	try {
		const [user, roles] = await Promise.all([getUserById(req.params.id), getUserRoles()])
		if (!user) return res.redirect('/users')
		return res.render('users/edit', { title: 'Edit User', user, roles })
	} catch (err) {
		return res.status(500).render('error', { message: 'Failed to load user', error: err.message })
	}
}
