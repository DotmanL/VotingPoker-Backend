import express, { Request, Response } from "express";
import cors from 'cors';
import { connectDB } from './src/config/database'

const PORT = process.env.PORT || 4000;
const app = express();
const http = require('http').Server(app);

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
connectDB()

app.use('/api/room', require('./routes/roomController'))


const socketIO = require('socket.io')(http, {
  cors: {
    origin: "*"
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

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Hello world',
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});