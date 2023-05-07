import express, { Request, Response } from "express";
import axios from "axios";
import { UserSchema } from "../models/userSchema";

const router = express.Router();

router.get(
  "/authenticateUser/:userId/:code",
  async (req: Request, res: Response) => {
    try {
      const { userId, code } = req.params;

      const user = await UserSchema.findById(userId);
      if (!user) {
        console.error("No user with this id exist");
      }

      if (code) {
        const data = {
          grant_type: "authorization_code",
          client_id: process.env.JIRA_CLIENT_ID,
          client_secret: process.env.JIRA_CLIENT_SECRET,
          code: code,
          redirect_uri: process.env.JIRA_REDIRECT_URL
        };

        try {
          const initialToken = await axios.post(
            process.env.JIRA_AUTH_URL as string,
            data,
            {
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          const refreshToken = initialToken.data.refresh_token;

          if (refreshToken) {
            const data = {
              grant_type: "refresh_token",
              client_id: process.env.JIRA_CLIENT_ID,
              client_secret: process.env.JIRA_CLIENT_SECRET,
              refresh_token: refreshToken
            };

            try {
              const secondToken = await axios.post(
                process.env.JIRA_AUTH_URL as string,
                data,
                {
                  headers: {
                    "Content-Type": "application/json"
                  }
                }
              );

              const accessToken = secondToken.data.access_token;

              if (!user) {
                return;
              }

              user.jiraAccessToken = accessToken;
              await user.save();
              return res.json({ scope: secondToken.data.scope });
            } catch (error) {
              console.error(error);
              return res
                .status(500)
                .send({ message: "Error refreshing access token" });
            }
          }
        } catch (error) {
          console.error(error);
          return res
            .status(400)
            .send({ message: "Invalid authorization code" });
        }
      }
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

module.exports = router;
