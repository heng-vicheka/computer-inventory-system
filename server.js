import 'dotenv/config'
import express from 'express'
import app from './src/config/view.js'
import corsMiddleware from './src/config/cors.js'
import rateLimitMiddleware from './src/config/rateLimit.js'
import auditLogger from './src/config/morgan.js'
import apiRouter from './src/routes/api.routes.js'
import clientRouter from './src/routes/client.routes.js'

app.disable('x-powered-by')
import usersRouter from './src/routes/users.js'
import transactionsRouter from './src/routes/transactions.js'

app.use(auditLogger)
app.use(corsMiddleware)
app.use(rateLimitMiddleware)
app.use(express.json({ limit: '20mb' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', apiRouter)
app.use('/', clientRouter)
app.use('/users', usersRouter)
app.use('/transactions', transactionsRouter)

const port = process.env.PORT

app.listen(port, () => {
	// console.debug(`Server running at http://localhost:${port}`)
})
