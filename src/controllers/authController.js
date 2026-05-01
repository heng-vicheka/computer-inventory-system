import crypto from 'crypto'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import { and, eq } from 'drizzle-orm'
import { authenticateUser, getAuthCookieOptions, issueAuthToken } from '../utils/auth.js'
import { getCookieValue } from '../utils/cookies.js'
import { verifyJwt } from '../utils/jwt.js'
import { db } from '../db/db.js'
import { userRoles, users } from '../db/schema.js'

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

async function resolveRoleId(role) {
	const desiredRoleName = role === 'admin' ? 'Admin' : 'Staff'
	const [mappedRole] = await db
		.select({ id: userRoles.id })
		.from(userRoles)
		.where(eq(userRoles.name, desiredRoleName))
		.limit(1)

	if (mappedRole) return mappedRole.id

	const [fallbackRole] = await db
		.select({ id: userRoles.id })
		.from(userRoles)
		.where(eq(userRoles.name, 'Guest'))
		.limit(1)

	if (fallbackRole) return fallbackRole.id

	const [firstRole] = await db.select({ id: userRoles.id }).from(userRoles).limit(1)
	return firstRole?.id ?? null
}

function deriveDisplayNameFromEmail(email) {
	const localPart = String(email || '').split('@')[0] || 'User'
	return localPart
		.split(/[._-]+/)
		.filter(Boolean)
		.map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
		.join(' ')
}

function isAuthenticated(req) {
	try {
		const token = getCookieValue(req.headers.cookie, 'auth_token')
		if (!token) return false
		verifyJwt(token)
		return true
	} catch {
		return false
	}
}

export function renderLogin(req, res) {
	if (isAuthenticated(req)) {
		return res.redirect('/')
	}

	return res.render('login', {
		layout: 'auth',
		title: 'Login',
		email: req.body?.email || '',
		role: req.body?.role || 'user',
	})
}

export function renderSignup(req, res) {
	if (isAuthenticated(req)) {
		return res.redirect('/')
	}

	return res.render('signup', { layout: 'auth', title: 'Sign Up' })
}

export async function handleSignup(req, res) {
	try {
		const { role, email, password, passwordConfirm } = req.body
		const normalizedEmail = String(email || '')
			.trim()
			.toLowerCase()
		const errors = []

		// Validation
		if (!normalizedEmail || !validateEmail(normalizedEmail)) {
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
			return res.render('signup', { layout: 'auth', errors, title: 'Sign Up' })
		}

		const [existingUser] = await db
			.select({ id: users.id, emailVerified: users.emailVerified, status: users.status })
			.from(users)
			.where(eq(users.email, normalizedEmail))
			.limit(1)

		if (existingUser) {
			if (existingUser.emailVerified) {
				return res.render('signup', {
					layout: 'auth',
					errors: ['An account with this email already exists. Please sign in instead.'],
					title: 'Sign Up',
				})
			}

			return res.render('signup', {
				layout: 'auth',
				errors: [
					'This email is already registered but not yet verified. Please check your inbox for the verification link.',
				],
				title: 'Sign Up',
			})
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Generate verification token
		const verificationToken = crypto.randomBytes(32).toString('hex')
		const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

		const roleId = await resolveRoleId(role)
		if (!roleId) {
			return res.render('signup', {
				layout: 'auth',
				errors: ['Unable to determine account role. Please try again later.'],
				title: 'Sign Up',
			})
		}

		await db.insert(users).values({
			name: deriveDisplayNameFromEmail(normalizedEmail),
			email: normalizedEmail,
			password: hashedPassword,
			userRoleId: roleId,
			passwordHash: hashedPassword,
			status: 'pending_verification',
			emailVerified: false,
			emailVerificationToken: verificationToken,
			verificationTokenExpiry: tokenExpiry.toISOString(),
		})

		// Send verification email
		const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: normalizedEmail,
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
			layout: 'auth',
			successMessage:
				'Account created! Check your email to verify your account. You will be redirected to login in 3 seconds.',
			title: 'Sign Up',
		})
	} catch {
		return res.render('signup', {
			layout: 'auth',
			errors: ['An error occurred during signup. Please try again.'],
			title: 'Sign Up',
		})
	}
}

export async function handleVerifyEmail(req, res) {
	try {
		const { token } = req.params
		const now = Date.now()

		if (!token) {
			return res.redirect('/login?verified=false&reason=invalid_token')
		}

		const [userRecord] = await db
			.select({
				id: users.id,
				emailVerified: users.emailVerified,
				verificationTokenExpiry: users.verificationTokenExpiry,
				status: users.status,
			})
			.from(users)
			.where(and(eq(users.emailVerificationToken, token), eq(users.isDeleted, false)))
			.limit(1)

		if (!userRecord) {
			return res.redirect('/login?verified=false&reason=invalid_token')
		}

		if (userRecord.emailVerified) {
			return res.redirect('/login?verified=true')
		}

		const expiryMillis = Date.parse(String(userRecord.verificationTokenExpiry || ''))
		if (!Number.isFinite(expiryMillis) || expiryMillis < now) {
			return res.redirect('/login?verified=false&reason=expired_token')
		}

		await db
			.update(users)
			.set({
				emailVerified: true,
				status: 'active',
				emailVerificationToken: null,
				verificationTokenExpiry: null,
				dateUpdated: new Date().toISOString(),
			})
			.where(eq(users.id, userRecord.id))

		return res.redirect('/login?verified=true')
	} catch {
		return res.redirect('/login?verified=false&reason=server_error')
	}
}

export async function handleLogin(req, res) {
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
			layout: 'auth',
			title: 'Login',
			email,
			role,
			errors,
			emailError,
			passwordError,
		})
	}

	try {
		const { user, reason } = await authenticateUser(email, password)
		if (!user) {
			const message =
				reason === 'inactive_user'
					? 'Your account is inactive. Please contact an administrator.'
					: 'Invalid email or password.'
			return res.render('login', {
				layout: 'auth',
				title: 'Login',
				email,
				role,
				errors: [message],
			})
		}

		const token = issueAuthToken(user)
		const cookieOptions = getAuthCookieOptions()
		res.cookie('auth_token', token, cookieOptions)
		res.cookie('role', user.role, cookieOptions)

		return res.redirect('/')
	} catch {
		return res.render('login', {
			layout: 'auth',
			title: 'Login',
			email,
			role,
			errors: ['Unable to sign in right now. Please try again.'],
		})
	}
}

export async function handleApiLogin(req, res) {
	const { email = '', password = '' } = req.body ?? {}
	const errors = []

	if (!email || !validateEmail(email)) {
		errors.push('Please enter a valid email address')
	}

	if (!password) {
		errors.push('Password is required')
	}

	if (errors.length > 0) {
		return res.status(400).json({
			message: 'Validation failed',
			errors,
		})
	}

	try {
		const { user, reason } = await authenticateUser(email, password)
		if (!user) {
			const message =
				reason === 'inactive_user'
					? 'Your account is inactive. Please contact an administrator.'
					: 'Invalid email or password.'
			return res.status(401).json({ message })
		}

		const token = issueAuthToken(user)
		return res.status(200).json({
			message: 'Login successful',
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		})
	} catch {
		return res.status(500).json({
			message: 'Unable to sign in right now. Please try again later.',
		})
	}
}

export function handleLogout(_req, res) {
	res.clearCookie('auth_token')
	res.clearCookie('auth')
	res.clearCookie('role')
	res.redirect('/login')
}
