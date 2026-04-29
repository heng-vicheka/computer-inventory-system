import rateLimit from 'express-rate-limit'

const parsedRateLimitMax = Number.parseInt(process.env.RATE_LIMIT_MAX ?? '', 10)
const parsedRateLimitWindow = Number.parseInt(process.env.RATE_LIMIT_WINDOW ?? '', 10)

const rateLimitMax = Number.isNaN(parsedRateLimitMax) ? 20 : parsedRateLimitMax
const rateLimitWindow = Number.isNaN(parsedRateLimitWindow) ? 60 * 1000 : parsedRateLimitWindow

const apiLimiter = rateLimit({
	windowMs: rateLimitWindow,
	limit: rateLimitMax,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many requests, please try again in a minute.',
})

export default apiLimiter
