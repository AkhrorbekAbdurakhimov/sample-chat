const express = require('express')
const app = express()
const fileUpload = require('express-fileupload')
const path = require('path')
const httpServer = require('http').createServer(app)
const { Server: socketIo } = require('socket.io')
const io = new socketIo(httpServer)
const { verify } = require('./lib/jwt')

const {host, PORT} = require('./config')

// middlewares
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(fileUpload({
    limits: 500 * 1024 * 1024
}))

// modules
const modules = require('./modules')
app.use(modules)

let users = []
io.on('connection', (socket) => {
    console.log("a user connected")

    socket.on("user joined", async ({token}) => {
        try {
            let { id, username, avatar_link } = verify(token)
            users.push({id, username, avatar_link, socketId: socket.id})
            io.emit("getUsers", users)
        } catch (err) {
            console.log(err)
        }  
    })
    socket.on("sendMessage", ({senderId, receiverId, message}) => {
        const senderUser = users.find(user => user.id == senderId)
        const receiverUser = users.find(user => user.id == receiverId)
        io.to(receiverUser.socketId).emit("getMessage", {
            senderUser,
            receiverUser,
            message
        })
    })
    socket.on("disconnect", async () => {
        users = users.filter((user) => user.socketId !== socket.id)
        io.emit("getUsers", users)
    })
    socket.on('watch', () => {
        socket.broadcast.emit('show')
    })
    socket.on('start typing', () => {
        socket.broadcast.emit('typing')
    })
    socket.on('stop typing', () => {
		socket.broadcast.emit('stopping')
	})
})

httpServer.listen(PORT, () => console.log(`server is running on http://${host}:${PORT}`))