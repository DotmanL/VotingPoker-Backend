import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./src/config/database";
import { IUserDetails } from "./interfaces/IUserDetails";

const PORT = process.env.PORT || 4001;
const app = express();
const http = require("http").Server(app);
const axios = require("axios");

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

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});

let users: IUserDetails[] = [];

socketIO.on("connection", (socket) => {
  console.log(`${socket.id} just connected!`);

  socket.on("user", (data: IUserDetails) => {
    console.log(`${data.name} just connected!`);
    socket.userId = data._id;
    //find user and set isConnected state to true and save to db, prevent same user by comparing db data and if is connectee is true already

    // Logic not working, doesn't prvent jjoing in the same browser
    const existingUser = users.find((user) => user._id === data._id);

    if (existingUser) {
      return { error: "user already exists" };
    } else {
      users.push(data);
    }
    const roomUsers = users.filter((user) => user.roomId === data.roomId);
    socket.join(data.roomId);
    socketIO.to(data.roomId).emit("welcome", { userId: data._id });
    socketIO.to(data.roomId).emit("userResponse", roomUsers);
  });

  socket.on("isVotedState", (data: IUserDetails) => {
    socketIO.to(data.roomId).emit("isVotedResponse", data);
  });

  socket.on("isUserVoted", (data: IUserDetails[]) => {
    socketIO.emit("isUserVotedResponse", data);
  });

  socket.on("votes", (data) => {
    socketIO.to(data.roomId).emit("votesResponse", data.allVotes);
  });

  socket.on("orderUpdate", (data) => {
    socketIO.to(data.roomId).emit("orderUpdateResponse", data);
  });

  // TODO: can't reset vote on leaving room, only do when vote session is completed.
  // implement many to many relationship between each room and userId and userVote.

  // socket.on("leaveRoom", async (data) => {
  // try {
  //   const response = await axios.put(
  //     getBaseUrl(`user/resetVote/${data.userId}`)
  //   );
  //   console.log("API response:", response.data);
  //   socket.emit("leaveRoomResponse", response.data);
  // } catch (error) {
  //   console.error("API request failed:", error);
  // }
  //   console.log(`${data.userName} just left the room!`);
  // });

  socket.on("disconnect", () => {
    users = users.filter((user) => user._id !== socket.userId);
    socketIO.emit("userResponse", users);
    console.log("user disconnected");
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
