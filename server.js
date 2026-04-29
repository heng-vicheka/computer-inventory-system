import 'dotenv/config'
import app from './src/config/view.js'
import corsMiddleware from './src/config/cors.js'
import rateLimitMiddleware from './src/config/rateLimit.js'
import auditLogger from './src/config/morgan.js'
import apiRouter from './src/routes/api.js'

app.use(auditLogger)
app.use(corsMiddleware)
app.use(rateLimitMiddleware)

app.use('/api', apiRouter)

const port = process.env.PORT || 3000

app.listen(port, () => {
	// console.log(`Server running at http://localhost:${port}`)
})
