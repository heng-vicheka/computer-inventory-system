import morgan from 'morgan'
import { createWriteStream, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const logsDirPath = join(__dirname, '..', '..', 'logs')
mkdirSync(logsDirPath, { recursive: true })

const auditLogPath = join(logsDirPath, 'audit.log')
const auditLogStream = createWriteStream(auditLogPath, { flags: 'a' })

const auditLogger = morgan('combined', { stream: auditLogStream })

export default auditLogger
