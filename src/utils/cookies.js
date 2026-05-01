export function parseCookies(cookieHeader) {
	if (!cookieHeader) return {}

	return Object.fromEntries(
		cookieHeader
			.split(';')
			.map((cookie) => cookie.trim().split('='))
			.map(([name, value]) => [name, decodeURIComponent(value || '')]),
	)
}

export function getCookieValue(cookieHeader, name) {
	return parseCookies(cookieHeader)[name]
}
