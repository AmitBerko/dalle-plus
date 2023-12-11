const BingApi = require('./BingApi')
const { createServer } = require('http')
const { Server } = require('socket.io')
const express = require('express')
const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 8080
const cors = require('cors')

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/ping', (req, res) => {
  console.log('pong!')
  res.send('pong')
})

// SocketIO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://super-dalle-3.web.app'],
  },
})

io.on('connection', (socket) => {
  console.log('user joined')

  socket.on('pingTest', (data) => {
    socket.emit('pingReceived', `data is ${data}`)
  })

  socket.on('generateImages', async (data) => {
    const { prompt, accounts, isSlowMode } = data
    const requests = accounts.map(async (account) => {
      try {
        const bingApi = new BingApi(account.cookie)
        const urls = await bingApi.createImages(prompt, isSlowMode)

        socket.emit('imagesGenerated', { urls, cookie: account.cookie })
      } catch (error) {
        console.log('error is ', error)
        socket.emit('imagesFailed', { cookie: account.cookie })
      }
    })

    Promise.all(requests)
      .then(() => {
        console.log('All accounts have finished generating')
      })
      .catch((error) => {
        console.log('error is ', error)
      })
  })
})

// Listen to port
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
})
