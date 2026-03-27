import 'dotenv/config'
import app from './app.js'

// Temporary test routes to preview HBS views
app.get('/', (_req, res) =>
	res.render('home', {
		title: 'Dashboard',
		stats: { available: 10, inUse: 5, maintenance: 2, retired: 1 },
	}),
)
app.get('/login', (_req, res) => res.render('auth/login', { title: 'Login', layout: 'auth' }))
app.get('/items', (_req, res) =>
	res.render('items/index', { title: 'Inventory', items: [], totalItems: 0, filters: {} }),
)

// eslint-disable-next-line no-console
app.listen(3000, () => console.log('http://localhost:3000'))
