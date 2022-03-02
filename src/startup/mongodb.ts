import mongoose from 'mongoose'

const { MONGODB_URI } = process.env
const initMongoDB = () => {
    mongoose.connect(MONGODB_URI || '').then(() => console.log('MongoDB connected')).catch(error => console.log(`MongoDB connection error: ${error}`))
}

export { initMongoDB }