import express, { Request, Response } from "express";
import cors from 'cors';
import { connectDB } from './src/config/database'
import { IUser } from "./models/IUser";
import { IUserDetails } from "./models/IUserDetails";

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

let users: any[] = []
// let userIds = {}

socketIO.on('connection', (socket) => {
  console.log(`${socket.id} user just connected!`);

  socket.on('user', (data: IUserDetails) => {
    socket.userId = data.userId
    const existingUser = users.find((user) => { user.userId === data.userId })
    if (existingUser) {
      return { error: "user already exists" }
    } else {
      users.push(data);
    }
    const roomUsers = users.filter((user) => user.roomId === data.roomId)
    socket.join(data.roomId)
    socketIO.to(data.roomId).emit('userResponse', roomUsers);
  })


  socket.on('isVotedState', (data: IUserDetails) => {
    socketIO.to(data.roomId).emit('isVotedResponse', data);
  })

  socket.on('isUserVoted', (data: IUserDetails[]) => {
    socketIO.emit('isUserVotedResponse', data);
  })

  //TODO: work on this for reveal all votes
  socket.on('votes', (data) => {
    socketIO.emit('votesResponse', data);
  });

  socket.on('disconnect', () => {
    users = users.filter((user) => user.userId !== socket.userId);
    socketIO.emit('userResponse', users);
    console.log('user disconnected');
    socket.disconnect();
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