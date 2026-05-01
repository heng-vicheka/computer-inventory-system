import express from 'express'
import {
	renderLogin,
	renderSignup,
	handleLogin,
	handleSignup,
	handleVerifyEmail,
	handleLogout,
} from '../controllers/authController.js'

const router = express.Router()

router.get('/login', renderLogin)
router.post('/login', handleLogin)

router.get('/signup', renderSignup)
router.post('/signup', handleSignup)

router.get('/verify-email/:token', handleVerifyEmail)

router.post('/logout', handleLogout)

export default router
