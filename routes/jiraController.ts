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
              const newRefreshToken = secondToken.data.refresh_token;

              if (!user) {
                return;
              }

              user.jiraAccessToken = accessToken;
              user.jiraRefreshToken = newRefreshToken;
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

router.get("/autoRefreshUser/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await UserSchema.findById(userId);
    if (!user) {
      console.error("No user with this id exist");
    }

    const data = {
      grant_type: "refresh_token",
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      refresh_token: user?.jiraRefreshToken
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
      const newRefreshToken = secondToken.data.refresh_token;

      if (!user) {
        return;
      }

      user.jiraAccessToken = accessToken;
      user.jiraRefreshToken = newRefreshToken;
      await user.save();
      return res.json({ scope: secondToken.data.scope });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error refreshing access token" });
    }
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.get(
  "/accessibleResources/:userId",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await UserSchema.findById(userId);
      if (!user) {
        console.error("No user with this id exist");
      }
      const response = await axios.get(
        `https://api.atlassian.com/oauth/token/accessible-resources` as string,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${user?.jiraAccessToken}`
          }
        }
      );

      return res.json({ data: response.data, status: response.status });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

router.get("/jiraBasicSearch/:userId/:jqlQuery", async (req, res) => {
  try {
    const { userId, jqlQuery } = req.params;

    const fieldsFromQuery = req.query.fields as string;
    const fieldsArray = fieldsFromQuery.split(",");
    const fields = ["summary", "status", "assignee", "description", "priority"];

    const user = await UserSchema.findById(userId);
    if (!user) {
      console.error("No user with this id exist");
    }

    const siteDetails = await axios.get(
      `https://api.atlassian.com/oauth/token/accessible-resources`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.jiraAccessToken}`
        }
      }
    );

    const requestBody = {
      jql: jqlQuery,
      startAt: 0,
      maxResults: 50,
      fields: !!req.query.fields ? fieldsArray : fields
    };

    const response = await axios.post(
      `https://api.atlassian.com/ex/jira/${siteDetails.data[0].id}/rest/api/3/search`,
      requestBody,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.jiraAccessToken}`
        }
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send("An error occurred while making the request to Jira");
  }
});

router.get("/getProjects/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserSchema.findById(userId);
    if (!user) {
      console.error("No user with this id exist");
    }

    const siteDetails = await axios.get(
      `https://api.atlassian.com/oauth/token/accessible-resources`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.jiraAccessToken}`
        }
      }
    );

    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${siteDetails.data[0].id}/rest/api/3/project/search`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.jiraAccessToken}`
        }
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send("An error occurred while making the request to Jira");
  }
});

module.exports = router;
