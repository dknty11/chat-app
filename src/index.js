const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } =require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('join', ({ username, room }) => {
        socket.join(room)

        server.emit('message', generateMessage('Welcome!'))
        // broadcast send to everyone but myself
        socket.broadcast.to.emit('message', generateMessage(`User ${username} has joined`))
    
        // 3 types to send to client: socket.emit, io.emit, socket.broadcast.emit

    })

    // Acknowledge that message has been sent to all connected client
    // using callback function
    socket.on('sendMessage', (message, cb) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return cb('Profanity is not allowed')
        }

        io.to.emit('message', generateMessage(message))
        cb()
    })

    socket.on('sendLocation', (locationMessage, cb) => {
        io.to.emit('locationMessage', generateMessage(locationMessage))
        cb('Your location has been shared to the others')
    })

    socket.on('disconnect', () => {
        io.to.emit('message', generateMessage('A user has left'))
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})