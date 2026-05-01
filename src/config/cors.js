import cors from 'cors'

const appOrigin = process.env.APP_ORIGIN ?? 'http://localhost:4000'

const corsOptions = {
	origin(origin, callback) {
		if (!origin || origin === appOrigin) {
			return callback(null, true)
		}

		return callback(new Error('CORS policy: Origin not allowed'))
	},
	credentials: true,
}

export default cors(corsOptions)
