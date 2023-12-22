import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { Server } from 'socket.io'
import { createServer } from 'http'
import webPush from 'web-push'

const app = express()
const prisma = new PrismaClient()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

// const vapidKeys = webPush.generateVAPIDKeys()
const vapidKeys = {
  publicKey: 'BCg6o6kHYX411GzjUQW8OTRYdmHAivNzaE1ZmY90MxEAPZVCA5v5NVIKAzJ9XRDaRoFbY83stF-OteGE12tsszQ',
  privateKey: 'aS6V2JAPKDKELaLJjca6OpNxA_mzv36N4uvx_MHr1pM'
}

webPush.setVapidDetails(
  'mailto:email@meudominio.com.br',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

app.use(cors())
app.use(express.json())

app.post('/login', async (req, res) => {

  const data: { email: string, endpoint: string, p256dh: string, auth: string } = req.body


  const user = await prisma.user.upsert({
    where: {email: data.email},
    update: data, 
    create: data
  })

  res.status(201).json(user)
})

io.on('connection', socket => {

  socket.on('messageServer', async(payload:{email: string, message: string}) => {

    io.emit('messageClient', payload)

    const user = await prisma.user.findUnique({
      where: {email: payload.email}
    })

    if(!user)return
    

    const subscription = {
      endpoint: user.endpoint,
      keys:{
        p256dh: user.p256dh,
        auth: user.auth
      }
    }
    setTimeout(() => {

      webPush.sendNotification(subscription, JSON.stringify(payload))
    }, 5000)

  })
})

const port = process.env.PORT ?? 3000
server.listen(port, () => { console.log(`\nServer run => http://localhost:${port}`) })