const express = require("express");
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const PORT = process.env.PORT || 4000;
app.use(cors());

const socketIO = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000"
  }
});


socketIO.on('connection', (socket) => {
  console.log(`${socket.id} user connected!`);

  socket.on('votes', (data) => {
    console.log(data, "votes response");
    socketIO.emit('votesResponse', data);
  });


  socket.on('disconnect', () => {
    console.log(' A user disconnected');
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});