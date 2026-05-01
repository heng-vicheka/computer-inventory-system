import { createUploadthing } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
	imageUploader: f({
		image: {
			maxFileSize: '4MB',
			maxFileCount: 5,
		},
	}).onUploadComplete(async ({ metadata, file }) => {
		return {
			uploadedBy: metadata.userId,
			url: file.ufsUrl,
		}
	}),
}
