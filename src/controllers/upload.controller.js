import { UTApi, UTFile } from 'uploadthing/server'

const utApi = new UTApi()

function parseDataUrl(dataUrl) {
	const match = /^data:(.+);base64,(.+)$/.exec(dataUrl)
	if (!match) {
		throw new Error('Invalid image data. Expected a base64 data URL.')
	}

	return {
		mimeType: match[1],
		base64Data: match[2],
	}
}

export const uploadImage = async (req, res) => {
	try {
		const { dataUrl, fileName, mimeType } = req.body

		if (!dataUrl || !fileName) {
			return res.status(400).json({ message: 'Image data and file name are required.' })
		}

		const parsed = parseDataUrl(dataUrl)
		const finalMimeType = String(mimeType || parsed.mimeType || 'application/octet-stream').trim()
		const fileBuffer = Buffer.from(parsed.base64Data, 'base64')
		const safeName = String(fileName || `device-${Date.now()}`)
			.trim()
			.replaceAll(/\s+/g, '-')

		const uploadFile = new UTFile([fileBuffer], safeName, {
			type: finalMimeType,
		})

		const result = await utApi.uploadFiles(uploadFile)
		const uploadResult = Array.isArray(result) ? result[0] : result

		if (!uploadResult || uploadResult.error) {
			return res.status(500).json({
				message: 'UploadThing upload failed.',
				error: uploadResult?.error?.message || 'Unknown upload error.',
			})
		}

		const fileData = uploadResult.data ?? uploadResult
		const fileUrl = fileData?.ufsUrl || fileData?.url || fileData?.appUrl

		if (!fileUrl) {
			return res.status(500).json({ message: 'UploadThing did not return a file URL.' })
		}

		return res.status(200).json({ url: fileUrl })
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to upload image.', error: error?.message || String(error) })
	}
}
