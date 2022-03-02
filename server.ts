import app from './src/app'
import { initMongoDB } from './src/startup'

const { PORT } = process.env
app.listen(PORT || 5000, () => console.log('Server started at PORT: 5000'))
initMongoDB()
