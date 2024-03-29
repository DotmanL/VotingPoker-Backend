import express, { Request, Response } from "express";
import { body } from "express-validator";
import { IRoom } from "../interfaces/IRoom";
import { RoomSchema } from "../models/roomSchema";
import { RoomUsersSchema } from "../models/roomUsersSchema";

const router = express.Router();

router.post(
  "/createRoom",
  [
    body("roomId").not().isEmpty(),
    body("name").not().isEmpty(),
    body("votingSystem").not().isEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const room = new RoomSchema<IRoom>({
        roomId: req.body.roomId,
        name: req.body.name,
        votingSystem: req.body.votingSystem,
        companyName: req.body.companyName
      });

      const roomDetails = await room.save();
      res.json(roomDetails);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Something went wrong");
    }
  }
);

router.get("/getRooms/:companyName", async (req: Request, res: Response) => {
  try {
    const { companyName } = req.params;
    const rooms = await RoomSchema.find({ companyName: companyName }).sort({
      date: -1
    });
    if (!rooms) {
      return res.status(404).json({ msg: "No rooms found" });
    }
    return res.json(rooms);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

router.get("/getRoomDetails/:id", async (req: Request, res: Response) => {
  try {
    const room = await RoomSchema.findOne({ roomId: req.params.id });
    if (!room) {
      return res.status(404).json({ msg: "No room found" });
    }
    return res.json(room);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

router.delete("/rooms/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  try {
    await RoomSchema.findByIdAndDelete(roomId);
    await RoomUsersSchema.deleteMany({ roomId: roomId });
    res.json({ message: `Room with ID ${roomId} deleted` });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

module.exports = router;
