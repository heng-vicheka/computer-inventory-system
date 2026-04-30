import crypto from 'crypto'
// import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'

// Email transporter setup
const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE || 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
})

// Validate password requirements
function validatePassword(password) {
	const requirements = {
		length: password.length >= 8,
		uppercase: /[A-Z]/.test(password),
		lowercase: /[a-z]/.test(password),
		number: /[0-9]/.test(password),
		special: /[!@#$%^&*]/.test(password),
	}
	return Object.values(requirements).every((req) => req)
}

// Validate email format
function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

function parseCookies(cookieHeader) {
	if (!cookieHeader) return {}
	return Object.fromEntries(
		cookieHeader
			.split(';')
			.map((cookie) => cookie.trim().split('='))
			.map(([name, value]) => [name, decodeURIComponent(value || '')]),
	)
}

function isAuthenticated(req) {
	const cookies = parseCookies(req.headers.cookie)
	return cookies.auth === '1'
}

export function renderLogin(req, res) {
	if (isAuthenticated(req)) {
		return res.redirect('/')
	}

	return res.render('login', {
		title: 'Login',
		email: req.body?.email || '',
		role: req.body?.role || 'user',
	})
}

export function renderSignup(req, res) {
	if (isAuthenticated(req)) {
		return res.redirect('/')
	}

	return res.render('signup', { title: 'Sign Up' })
}

export async function handleSignup(req, res) {
	try {
		const { role, email, password, passwordConfirm } = req.body
		const errors = []

		// Validation
		if (!email || !validateEmail(email)) {
			errors.push('Please provide a valid email address')
		}

		if (!password) {
			errors.push('Password is required')
		}

		if (!passwordConfirm) {
			errors.push('Password confirmation is required')
		}

		if (password !== passwordConfirm) {
			errors.push('Passwords do not match')
		}

		if (!validatePassword(password)) {
			errors.push(
				'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
			)
		}

		if (!role || (role !== 'user' && role !== 'admin')) {
			errors.push('Please select a valid role')
		}

		if (errors.length > 0) {
			return res.render('signup', { errors, title: 'Sign Up' })
		}

		// Check if user already exists
		// TODO: Connect to database and check if user exists
		// For now, just continue with signup process

		// Hash password
		// const hashedPassword = await bcrypt.hash(password, 10)

		// Generate verification token
		const verificationToken = crypto.randomBytes(32).toString('hex')
		// const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

		// TODO: Save user to database with:
		// - email, hashedPassword, role, status: 'pending_verification'
		// - emailVerificationToken, verificationTokenExpiry

		// Send verification email
		const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Verify Your BitBin IT Inventory Account',
			html: `
        <h2>Welcome to BitBin IT Inventory</h2>
        <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #185FA5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
		}

		// Send email
		await transporter.sendMail(mailOptions)

		// Show success message and redirect to login
		return res.render('signup', {
			successMessage:
				'Account created! Check your email to verify your account. You will be redirected to login in 3 seconds.',
			title: 'Sign Up',
		})
	} catch {
		// console.error('Signup error:', error)
		return res.render('signup', {
			errors: ['An error occurred during signup. Please try again.'],
			title: 'Sign Up',
		})
	}
}

export async function handleVerifyEmail(req, res) {
	try {
		// const { token } = req.params

		// TODO: Find user by verification token
		// TODO: Check if token is expired
		// TODO: Update user emailVerified to true
		// TODO: Clear emailVerificationToken and verificationTokenExpiry

		// For now, just redirect to login
		res.redirect('/login?verified=true')
	} catch {
		// console.error('Verification error:', error)
		res.render('email-verification-error', {
			error: 'An error occurred during email verification. Please try again.',
		})
	}
}

export function handleLogin(req, res) {
	const { email = '', password = '', role = 'user' } = req.body
	const errors = []
	let emailError = ''
	let passwordError = ''

	if (!email || !validateEmail(email)) {
		emailError = 'Please enter a valid email address'
		errors.push(emailError)
	}

	if (!password) {
		passwordError = 'Password is required'
		errors.push(passwordError)
	}

	if (errors.length > 0) {
		return res.render('login', {
			title: 'Login',
			email,
			role,
			errors,
			emailError,
			passwordError,
		})
	}

	const userRole = role === 'admin' ? 'Admin' : 'Technician'

	res.cookie('auth', '1', { httpOnly: true, sameSite: 'lax' })
	res.cookie('role', userRole, { httpOnly: true, sameSite: 'lax' })

	return res.redirect('/')
}

export function handleLogout(_req, res) {
	res.clearCookie('auth')
	res.clearCookie('role')
	res.redirect('/login')
}
