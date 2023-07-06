import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./src/config/database";
import { IRoomUsers } from "./interfaces/IRoomUsers";

const PORT = process.env.PORT || 4001;
const app = express();
const http = require("http").Server(app);

if (process.env.NODE_ENV !== "production") require("dotenv").config();

export const getBaseUrl = (route: string) => {
  let url;
  switch (process.env.NODE_ENV) {
    case "production":
      url = `https://votingpokerapi.herokuapp.com/api/${route}/`;
      break;
    case "development":
    default:
      url = `http://localhost:4001/api/${route}/`;
  }

  return url;
};

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.use("/api/room", require("./routes/roomController"));
app.use("/api/user", require("./routes/userController"));
app.use("/api/issues", require("./routes/issuesController"));
app.use("/api/roomusers", require("./routes/roomUsersController"));
app.use("/api/jira", require("./routes/jiraController"));

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});

let users: IRoomUsers[] = [];

socketIO.on("connection", (socket) => {
  const socketUsers = {};
  socket.on("user", (data: IRoomUsers) => {
    console.log(`${data.userName} just connected!`);

    const { _id: userId, roomId: roomId, userName: userName } = data;
    socket.userId = userId!;
    socket.roomId = roomId;
    socket.userName = userName;

    if (!socket.userName || !data._id) {
      return;
    }

    if (socketUsers[userId!]) {
      socket = socketUsers[userId!];
    } else {
      socketUsers[userId!] = socket;
    }

    const existingUserInRoom = users.some(
      (user) => user._id === data._id && user.roomId === data.roomId
    );

    if (!existingUserInRoom) {
      users.push(data);
    }

    const roomUsers = users.filter((user) => user.roomId === data.roomId);
    socket.join(data.roomId);
    socketIO.to(data.roomId).emit("welcome", { userId: data._id });
    socketIO.to(data.roomId).emit("userResponse", roomUsers);
  });

  socket.on("isVotedState", (data: IRoomUsers) => {
    socketIO.to(data.roomId).emit("isVotedResponse", data);
  });

  socket.on("isUserVoted", (data: IRoomUsers[]) => {
    socketIO.emit("isUserVotedResponse", data);
  });

  socket.on("endCelebration", (data) => {
    socketIO.to(data.roomId).emit("endCelebrationResponse", data);
  });

  socket.on("votes", (data) => {
    socketIO.to(data.roomId).emit("votesResponse", data.allVotes);
  });

  socket.on("orderUpdate", (data) => {
    socketIO.to(data.roomId).emit("orderUpdateResponse", data);
  });

  socket.on("isIssuesSidebarOpen", (data) => {
    socketIO.to(data.roomId).emit("isIssuesSidebarOpenResponse", data);
  });

  socket.on("triggerRefetchIssues", (data) => {
    socketIO.to(data.roomId).emit("triggerRefetchIssuesResponse", data);
  });

  socket.on("isActiveCard", (data) => {
    socketIO.to(data.roomId).emit("isActiveCardOpenResponse", data);
  });

  socket.on("updateActiveIssueId", (data) => {
    socketIO.to(data.roomId).emit("updateActiveIssueIdResponse", data);
  });

  socket.on("disconnect", () => {
    users = users.filter(
      (user) => !(user._id === socket.userId && user.roomId === socket.roomId)
    );
    socketIO.emit("userResponse", users);
    console.log(`user just disconnected`);
    socket.disconnect();
  });
});

app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "Hello world"
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
