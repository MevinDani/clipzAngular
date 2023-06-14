const express = require('express')
const mongoose = require('mongoose')
const postRoutes = require('./routes/posts')
const userRoutes = require('./routes/user')
const conversationRoutes = require('./routes/conversation')
const messageRoutes = require('./routes/message')
const http = require('http');
const socketIO = require('socket.io');
// const cors = require('cors')
const app = express()
const server = http.createServer(app);
const io = socketIO(server);

// app.use(cors({ origin: 'http://localhost:4200' }))

mongoose.connect("mongodb+srv://admin:admin123@clusterclipz.fjbilpl.mongodb.net/?retryWrites=true&w=majority")

const User = require('./service/userDb')
const Post = require('./service/db')

// mongoose.connect('mongodb://127.0.0.1:27017/vidz', { useNewUrlParser: true })
//     .then(() => { console.log("mongoose connected") })
//     .catch(err => { console.log("error", err); })

app.listen(2000, () => {
    console.log("server running on port 2000");
})

app.use(express.json())
// app.use('/images', express.static(path.join('images')))

// cors middleware without cors
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access_token")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH, OPTIONS")
    next()
})

app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/messages', messageRoutes)


// Socket.IO connection handling
// io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Handle socket events here

//     // Handle disconnection
//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
// });

// // Start the server
// const port = 2000;
// server.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

