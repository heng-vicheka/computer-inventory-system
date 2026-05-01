import express from 'express'
import { engine } from 'express-handlebars'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getCookieValue, parseCookies } from '../utils/cookies.js'
import { verifyJwt } from '../utils/jwt.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

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

function authMiddleware(req, res, next) {
	if (req.path.startsWith('/api')) {
		return next()
	}

	if (
		req.path === '/login' ||
		req.path === '/logout' ||
		req.path === '/signup' ||
		req.path.startsWith('/verify-email')
	) {
		return next()
	}

	if (!isAuthenticated(req)) {
		return res.redirect('/login')
	}

	return next()
}

function viewLocalsMiddleware(req, res, next) {
	const cookies = parseCookies(req.headers.cookie)
	let userRole = cookies.role || 'Technician'

	try {
		const token = cookies.auth_token
		if (token) {
			const payload = verifyJwt(token)
			userRole = payload.role || userRole
		}
	} catch {
		// ignore invalid token and use fallback role value
	}

	res.locals.currentPath = req.path
	res.locals.userRole = userRole
	next()
}

// ─── View Engine ─────────────────────────────────────────────────────────────
app.engine(
	'hbs',
	engine({
		extname: '.hbs',
		defaultLayout: 'main',
		layoutsDir: join(__dirname, '..', '..', 'views', 'layouts'),
		partialsDir: join(__dirname, '..', '..', 'views', 'partials'),
		helpers: {
			eq: (a, b) => a === b,
			ne: (a, b) => a !== b,
			formatDate(date) {
				if (!date) return '—'
				return new Date(date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				})
			},
			statusBadge(status) {
				const map = {
					Available: 'success',
					'In-Use': 'primary',
					Maintenance: 'warning',
					Retired: 'secondary',
				}
				return map[status] ?? 'secondary'
			},
			roleBadge(role) {
				return role === 'Admin' ? 'danger' : 'info'
			},
			truncate(str, len = 40) {
				if (!str) return ''
				return str.length > len ? str.slice(0, len) + '…' : str
			},
		},
	}),
)

app.set('view engine', 'hbs')
app.set('views', join(__dirname, '..', '..', 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.static(join(__dirname, '..', '..', 'public')))
app.use(authMiddleware)
app.use(viewLocalsMiddleware)

// ─── Routes ──────────────────────────────────────────────────────────────────

export default app
