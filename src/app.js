const express = require('express');
const dotenv = require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const colors = require('colors');

const chats = require('./data/data');
const connectDB = require('./config/db.config');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// connecting to db
connectDB();

// middlewares
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

app.get('/', (req, res) => {
  res.send('API running');
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// introducing error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`.bgBlue.black);
});

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.8.107:3000'],
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io');
  // creating room from client/frontend
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined Room: ' + room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });

  // socket.off("setup", () => {
  //   console.log("User disconnected");
  //   socket.leave(userData._id);
  // });
});
