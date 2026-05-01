import crypto from 'crypto'

function base64UrlEncode(value) {
	const encoded = Buffer.from(value).toString('base64')
	return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(value) {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
	const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
	return Buffer.from(padded, 'base64').toString()
}

function parseDurationToSeconds(value) {
	if (!value) return 60 * 60

	const raw = String(value).trim()
	if (/^\d+$/.test(raw)) {
		return Number(raw)
	}

	const match = raw.match(/^(\d+)([smhd])$/i)
	if (!match) {
		return 60 * 60
	}

	const amount = Number(match[1])
	const unit = match[2].toLowerCase()
	const factor = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 60 * 60 : 60 * 60 * 24
	return amount * factor
}

function signHmacSha256(data, secret) {
	return crypto.createHmac('sha256', secret).update(data).digest('base64url')
}

export function signJwt(payload, options = {}) {
	const secret = options.secret || process.env.JWT_SECRET
	if (!secret) {
		throw new Error('JWT secret is not configured.')
	}

	const now = Math.floor(Date.now() / 1000)
	const expiresInSeconds = parseDurationToSeconds(
		options.expiresIn || process.env.JWT_EXPIRATION || '1h',
	)

	const header = {
		alg: 'HS256',
		typ: 'JWT',
	}

	const body = {
		...payload,
		iat: now,
		exp: now + expiresInSeconds,
	}

	const encodedHeader = base64UrlEncode(JSON.stringify(header))
	const encodedPayload = base64UrlEncode(JSON.stringify(body))
	const data = `${encodedHeader}.${encodedPayload}`
	const signature = signHmacSha256(data, secret)

	return `${data}.${signature}`
}

export function verifyJwt(token, options = {}) {
	const secret = options.secret || process.env.JWT_SECRET
	if (!secret) {
		throw new Error('JWT secret is not configured.')
	}

	if (!token || typeof token !== 'string') {
		throw new Error('Invalid token.')
	}

	const segments = token.split('.')
	if (segments.length !== 3) {
		throw new Error('Malformed token.')
	}

	const [encodedHeader, encodedPayload, providedSignature] = segments
	const data = `${encodedHeader}.${encodedPayload}`
	const expectedSignature = signHmacSha256(data, secret)

	const providedBuffer = Buffer.from(providedSignature)
	const expectedBuffer = Buffer.from(expectedSignature)
	if (
		providedBuffer.length !== expectedBuffer.length ||
		!crypto.timingSafeEqual(providedBuffer, expectedBuffer)
	) {
		throw new Error('Invalid token signature.')
	}

	const header = JSON.parse(base64UrlDecode(encodedHeader))
	if (header.alg !== 'HS256') {
		throw new Error('Unsupported token algorithm.')
	}

	const payload = JSON.parse(base64UrlDecode(encodedPayload))
	const now = Math.floor(Date.now() / 1000)

	if (typeof payload.exp !== 'number' || payload.exp <= now) {
		throw new Error('Token expired.')
	}

	return payload
}
