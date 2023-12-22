import express from 'express'
import cors from 'cors'
import { engine } from 'express-handlebars'
import { PrismaClient } from '@prisma/client'
import { Server } from 'socket.io'
import { createServer } from 'http'

const app = express()
const prisma = new PrismaClient()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

app.use(cors())
app.use(express.json())
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', `${__dirname}/views`);

/**
 * 
 */

app.post('/login', async (req, res) => {

  const data = req.body as { email: string }

  const userExist = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  })

  if (userExist) {
    return res.json(userExist)
  }

  const user = await prisma.user.create({
    data: data,
  })

  res.status(201).json(user)
})


io.on('connection', socket => {

  socket.on('messageServer', payload => {

    io.emit('messageClient', payload)
  })
})


const port = process.env.PORT ?? 3000
server.listen(port, () => { console.log(`\nServer run => http://localhost:${port}`) })