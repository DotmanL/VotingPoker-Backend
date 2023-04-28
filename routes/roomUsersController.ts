import express, { Request, Response } from "express";
import { body } from "express-validator";
import { IRoomUsers } from "../interfaces/IRoomUsers";
import { RoomUsersSchema } from "../models/roomUsersSchema";

const router = express.Router();

router.post("/createRoomUser", async (req: Request, res: Response) => {
  const { userId, roomId, userName, currentVote, activeIssueId, votedState } =
    req.body;

  const roomUsers = new RoomUsersSchema<IRoomUsers>({
    userId,
    roomId,
    userName,
    currentVote,
    activeIssueId,
    votedState
  });

  try {
    const existingUserRoom = await RoomUsersSchema.findOne({
      roomId: roomId,
      userId: userId
    });

    if (existingUserRoom) {
      return res.json(existingUserRoom);
    }
    const savedRoomusers = await roomUsers.save();
    res.status(201).json(savedRoomusers);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

router.get("/roomUsers/:roomId", async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    const roomUsersInRoom: IRoomUsers[] = await RoomUsersSchema.find({
      roomId
    });
    if (!roomUsersInRoom) {
      return res.status(404).send({ message: "No roomusers here" });
    }
    res.json(roomUsersInRoom);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

router.put(
  "/roomUsers/:roomId/:userId",
  async (req: Request, res: Response) => {
    const { roomId, userId } = req.params;
    const { currentVote, activeIssueId, votedState } = req.body;

    try {
      const updatedUserRoom = await RoomUsersSchema.findOneAndUpdate(
        { roomId: roomId, userId: userId },
        {
          currentVote: currentVote,
          activeIssueId: activeIssueId,
          votedState: votedState
        },
        { new: true, upsert: true }
      );
      res.json(updatedUserRoom);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Something went wrong");
    }
  }
);

router.put("/roomUsers/:roomId", async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { activeIssueId } = req.body;

  try {
    const updatedUserRoom = await RoomUsersSchema.updateMany(
      { roomId: roomId },
      {
        activeIssueId: activeIssueId
      },
      { new: true, upsert: true }
    );
    res.json(updatedUserRoom);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

router.put(
  "/resetRoomUserVote/:roomId",
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { votedState } = req.body;
    try {
      const updatedUserRoom = await RoomUsersSchema.updateMany(
        {
          roomId: roomId
        },
        {
          $unset: { currentVote: "" },
          votedState: votedState
        }
      );

      res.json(updatedUserRoom);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Something went wrong");
    }
  }
);

module.exports = router;
