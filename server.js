import 'dotenv/config'
import app from './src/config/view.js'

const port = process.env.PORT || 3000

app.listen(port, () => {
	// console.log(`Server running at http://localhost:${port}`)
})
