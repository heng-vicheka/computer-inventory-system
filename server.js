import 'dotenv/config'
import express from 'express'
import app from './src/config/view.js'
import corsMiddleware from './src/config/cors.js'
import rateLimitMiddleware from './src/config/rateLimit.js'
import auditLogger from './src/config/morgan.js'
import apiRouter from './src/routes/api.routes.js'
import clientRouter from './src/routes/client.routes.js'

app.disable('x-powered-by')

app.use(auditLogger)
app.use(corsMiddleware)
app.use(rateLimitMiddleware)
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: false }))

app.use('/api', apiRouter)
app.use('/', clientRouter)

const port = Number(process.env.PORT) || 4000

if (process.env.VERCEL !== '1') {
	app.listen(port, () => {
		console.log(`Server running at http://localhost:${port}`)
	})
}

export default app
