import express from 'express'
import { engine } from 'express-handlebars'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

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

function authMiddleware(req, res, next) {
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

// ─── Routes ──────────────────────────────────────────────────────────────────

export default app
