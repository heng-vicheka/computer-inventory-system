import cors from 'cors'

function normalizeOrigin(origin) {
	return String(origin || '')
		.trim()
		.replace(/\/+$/, '')
}

const configuredOrigins = String(process.env.APP_ORIGIN || '')
	.split(',')
	.map(normalizeOrigin)
	.filter(Boolean)

const defaultOrigins = ['http://localhost:4000', 'http://127.0.0.1:4000']

const vercelUrl = normalizeOrigin(
	process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
)

const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins, vercelUrl].filter(Boolean))

const corsOptions = {
	origin(origin, callback) {
		if (!origin) {
			return callback(null, true)
		}

		const normalizedOrigin = normalizeOrigin(origin)

		if (allowedOrigins.has(normalizedOrigin)) {
			return callback(null, true)
		}

		// Do not throw here; just deny CORS instead of crashing request handling.
		return callback(null, false)
	},
	credentials: true,
}

export default cors(corsOptions)
