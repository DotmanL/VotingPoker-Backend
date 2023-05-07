import express, { Request, Response } from "express";
import { body } from "express-validator";
import { IUser } from "../interfaces/IUser";
import { UserSchema } from "../models/userSchema";
import { RoomUsersSchema } from "../models/roomUsersSchema";

const router = express.Router();

router.post(
  "/createUser",
  [body("name").not().isEmpty()],
  async (req: Request, res: Response) => {
    try {
      const user = new UserSchema<IUser>({
        name: req.body.name
      });

      const userDetails = await user.save();
      return res.json(userDetails);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Something went wrong");
    }
  }
);

router.get(
  "/getCurrentUserByName/:name",
  async (req: Request, res: Response) => {
    try {
      const user = await UserSchema.findOne({ name: req.params.name });
      if (!user) {
        return res.status(404).json({ msg: "No user found" });
      }
      return res.json(user);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Something went wrong");
    }
  }
);

router.get("/loadUser/:_id", async (req: Request, res: Response) => {
  try {
    const user = await UserSchema.findById(req.params._id);
    if (!user) {
      return res.status(404).json({ msg: "No user found" });
    }
    return res.json(user);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

router.get("/usersByRoom/:roomId", async (req: Request, res: Response) => {
  try {
    const roomUsers: IUser[] = await UserSchema.find({
      currentRoomId: req.params.roomId
    });
    if (!roomUsers) {
      return res.status(404).json({ msg: "No user in this room" });
    }
    return res.json(roomUsers);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

// get all room users - to use when resetting voting session
// update user fields endpoint - use to replace localStorage SetItem

router.put("/updateUser/:_id", async (req: Request, res: Response) => {
  const {
    name,
    currentVote,
    currentRoomId,
    votedState,
    jiraAccessToken,
    isConnected
  } = req.body;

  const userFields = {
    _id: req.params._id,
    name,
    currentVote,
    currentRoomId,
    votedState,
    jiraAccessToken,
    isConnected
  };

  try {
    let updatedUser = await UserSchema.findOneAndUpdate(
      { _id: req.params._id },
      { $set: userFields },
      { new: true, upsert: true }
    );
    return res.json(updatedUser);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

router.put("/resetVote/:_id", async (req: Request, res: Response) => {
  try {
    const updatedUser = await UserSchema.findOne({ _id: req.params._id });
    if (!updatedUser) {
      return;
    }
    updatedUser.currentVote = undefined;
    updatedUser.votedState = false;
    await updatedUser.save();
    return res.json(updatedUser);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

router.delete("/deleteUser/:_id", async (req: Request, res: Response) => {
  try {
    const user = await UserSchema.findById(req.params._id);
    if (!user) {
      return;
    }
    await user.remove();
    await RoomUsersSchema.deleteMany({ userId: req.params._id });
    res.json({ msg: "User Deleted" });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

module.exports = router;
