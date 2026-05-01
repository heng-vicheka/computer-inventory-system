export function parseCookies(cookieHeader) {
	if (!cookieHeader) return {}

	return Object.fromEntries(
		cookieHeader
			.split(';')
			.map((cookie) => cookie.trim().split('='))
			.map(([name, value]) => {
				try {
					return [name, decodeURIComponent(value || '')]
				} catch {
					return [name, value || '']
				}
			}),
	)
}

export function getCookieValue(cookieHeader, name) {
	return parseCookies(cookieHeader)[name]
}
