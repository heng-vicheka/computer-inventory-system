import express from 'express'
import { engine } from 'express-handlebars'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// ─── View Engine ─────────────────────────────────────────────────────────────
app.engine(
	'hbs',
	engine({
		extname: '.hbs',
		defaultLayout: 'main',
		layoutsDir: join(__dirname, 'views', 'layouts'),
		partialsDir: join(__dirname, 'views', 'partials'),
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
app.set('views', join(__dirname, 'views'))

// ─── Static Assets (for CSS/JS used by views) ────────────────────────────────
app.use(express.static(join(__dirname, 'public')))

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
	res.render('home')
})

export default app
