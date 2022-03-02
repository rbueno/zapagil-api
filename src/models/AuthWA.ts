import { Schema, model } from 'mongoose'

const authWASchema = {
    authCreds: {
        type: String,
        required: true
    },
    userWA: {
        type: String,
        required: true,
        unique: true
    }
}

export const AuthWA = model('AuthWA', new Schema(authWASchema))