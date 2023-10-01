import express, { Request, Response } from "express";
import {
  RoomMessagesSchema,
  decryptMessage,
  encryptMessage
} from "../models/roomMessagesSchema";
import { IRoomMessage, IUserMessage } from "../interfaces/IRoomMessage";
import { RoomSchema } from "../models/roomSchema";
import crypto from "crypto";

const router = express.Router();

router.post(
  "/createOrUpdateRoomMessage",
  async (req: Request, res: Response) => {
    const { roomId, messages } = req.body;

    try {
      const existingRoomMessages = await RoomMessagesSchema.findOne({
        roomId: roomId
      });

      if (existingRoomMessages) {
        const { encryptedMessage, iv } = encryptMessage(messages[0].message);
        const userMessage: IUserMessage = {
          userId: messages[0].userId,
          userName: messages[0].userName,
          message: encryptedMessage,
          iv: iv
        };

        existingRoomMessages.messages.push(userMessage);
        await existingRoomMessages.save();
        return res.json(existingRoomMessages);
      }

      const { encryptedMessage, iv } = encryptMessage(messages[0].message);

      const userMessage: IUserMessage = {
        userId: messages[0].userId,
        userName: messages[0].userName,
        message: encryptedMessage,
        iv: iv
      };

      const roomNameToBeCreated = (await RoomSchema.findOne({ roomId: roomId }))
        ?.name;

      const roomMessages = new RoomMessagesSchema<IRoomMessage>({
        roomId,
        roomName: roomNameToBeCreated,
        messages: [userMessage]
      });

      const savedRoomMessages = await roomMessages.save();
      res.status(201).json(savedRoomMessages);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Something went wrong");
    }
  }
);

router.get("/getRoomMessages/:roomId", async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    const roomMessage: IRoomMessage | null = await RoomMessagesSchema.findOne({
      roomId
    });

    if (!roomMessage) {
      return res.json(roomMessage);
    }
    const decryptedMessages = roomMessage.messages.map((message) => ({
      userId: message.userId,
      userName: message.userName,
      message: decryptMessage(message.message, message.iv)
    }));

    res.json(decryptedMessages);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Something went wrong");
  }
});

module.exports = router;
