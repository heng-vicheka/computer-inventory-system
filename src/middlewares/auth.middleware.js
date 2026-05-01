import { getCookieValue } from '../utils/cookies.js'
import { verifyJwt } from '../utils/jwt.js'

function readBearerToken(header) {
	if (!header || typeof header !== 'string') return ''
	const [type, token] = header.trim().split(/\s+/)
	if (type !== 'Bearer' || !token) return ''
	return token
}

export function authenticateApiJwt(req, res, next) {
	const bearerToken = readBearerToken(req.headers.authorization)
	const cookieToken = getCookieValue(req.headers.cookie, 'auth_token')
	const token = bearerToken || cookieToken

	if (!token) {
		return res.status(401).json({ message: 'Authentication token is required.' })
	}

	try {
		req.auth = verifyJwt(token)
		return next()
	} catch {
		return res.status(401).json({ message: 'Invalid or expired authentication token.' })
	}
}
