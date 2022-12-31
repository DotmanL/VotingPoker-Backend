import express, { Request, Response } from "express";
import { body } from "express-validator";
import { IRoom } from "../interfaces/IRoom";
import { RoomSchema } from "../models/roomSchema";

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
        votingSystem: req.body.votingSystem
      });

      const roomDetails = await room.save();
      res.json(roomDetails);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Something went wrong");
    }
  }
);

router.get("/getRooms", async (req: Request, res: Response) => {
  try {
    const rooms = await RoomSchema.find().sort({ date: -1 });
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

module.exports = router;
