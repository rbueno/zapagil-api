import 'dotenv/config'
import makeWASocket, { DisconnectReason, useSingleFileAuthState, initAuthCreds, BufferJSON } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import express from 'express'
import morgan from 'morgan'
import { authWAService } from './service'
const app = express()

app.use(express.json({}))
app.use(morgan('dev'))

const userWASocket = { bueno: {}}
const socketByUser = new Map()

app.get('/health', async (req, res) => {

    res.status(200).json({
        instances: socketByUser.size
    })
})

app.post('/session', async (req, res) => {
const userWA = req.headers['x-unique-user']
if (!userWA) throw new Error('Conta de usuário não encontrada, reconectar WhatsApp')

const { state, saveState } = await authWAService(userWA)
if (!state) throw new Error('State não criado ou encontrado')
    async function connectToWhatsApp () {
        const socketCreated = makeWASocket({
            // can provide additional config here
            printQRInTerminal: true,
            auth: state
        })
        socketByUser.set(userWA, socketCreated)
        const sock = socketByUser.get(userWA)
        
        // @ts-ignore
        // const sock = userWASocket[uniqueUser]

        sock.ev.on ('creds.update', await saveState)
        sock.ev.on('connection.update', (update: any) => {
            const { connection, lastDisconnect } = update
            if(connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
                console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
                // reconnect if not logged out
                if(shouldReconnect) {
                    connectToWhatsApp()
                }
            } else if(connection === 'open') {
                console.log('opened connection')
            }
        })

    }
    // run in main file
    await connectToWhatsApp()
    
    res.status(200).json({ message: 'started'})
})

app.post('/sendmessage/text', async (req, res) => {

    const uniqueUser = req.headers['x-unique-user']
    console.log('req.body', req.body)
    const sock = socketByUser.get(uniqueUser)
    if (!sock) res.status(400).json({ message: 'Conta de usuário não encontrada, reconectar WhatsApp'})

    const { messages } = req.body

    for (const message of messages) {
        const { phoneToSend, textToSend } = message
        const id = `${phoneToSend}@s.whatsapp.net` // the WhatsApp ID 
        const sentMsg  = await sock.sendMessage(id, { text: textToSend })
        // send a simple text!
        console.log('sentMsg =====>', sentMsg)
    }

    res.status(200).json({ message: 'sent'})
})

export default app
