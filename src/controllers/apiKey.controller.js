import { createApiKey, getApiKeys, revokeApiKey } from '../models/apiKey.model.js'

function toDateOnly(value) {
	if (!value) return '-'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
	return date.toISOString().slice(0, 10)
}

function buildStats(rows) {
	const active = rows.filter((key) => key.status === true && key.isDeleted !== true).length
	const revoked = rows.filter((key) => key.status === false || key.isDeleted === true).length

	return {
		total: rows.length,
		active,
		revoked,
	}
}

export async function getApiKeyPageData() {
	const rows = await getApiKeys()
	const keys = rows.map((key) => {
		const revoked = key.status === false || key.isDeleted === true

		return {
			id: key.id,
			label: key.label,
			keyPreview: '**********',
			createdAt: toDateOnly(key.dateCreated),
			status: revoked ? 'Revoked' : 'Active',
			statusClass: revoked ? 'danger' : 'success',
			isRevoked: revoked,
		}
	})

	return {
		apiKeys: keys,
		stats: buildStats(rows),
	}
}

export const renderApiKeys = async (req, res) => {
	try {
		const pageData = await getApiKeyPageData()
		res.render('api-key', {
			title: 'API Keys',
			...pageData,
		})
	} catch (error) {
		res.status(500).render('error', {
			message: 'Failed to load API keys',
			error: error.message,
		})
	}
}

export const listApiKeys = async (_req, res) => {
	try {
		const pageData = await getApiKeyPageData()
		res.status(200).json(pageData)
	} catch (error) {
		res.status(500).json({
			message: 'Failed to load API keys',
			error: error.message,
		})
	}
}

export const generateApiKey = async (req, res) => {
	const wantsJson = req.accepts(['html', 'json']) === 'json'

	try {
		const createdKey = await createApiKey(req, req.body.label)

		if (wantsJson) {
			return res.status(201).json({
				message: 'API key generated successfully.',
				apiKey: {
					id: createdKey.id,
					label: createdKey.label,
					key: createdKey.secret,
				},
			})
		}

		return res.redirect('/apikeys')
	} catch (error) {
		if (wantsJson) {
			return res.status(400).json({
				message: 'Failed to generate API key',
				error: error.message,
			})
		}

		return res.status(400).render('error', {
			message: 'Failed to generate API key',
			error: error.message,
		})
	}
}

export const revokeApiKeyById = async (req, res) => {
	try {
		await revokeApiKey(req, req.params.id)
		res.status(200).json({ message: 'API key revoked successfully.' })
	} catch (error) {
		res.status(400).json({
			message: 'Failed to revoke API key',
			error: error.message,
		})
	}
}
