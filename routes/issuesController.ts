import express, { Request, Response } from "express";
import { body } from "express-validator";
import { IIssue, IIssueDocument } from "../interfaces/Issues";
import { IssueSchema } from "../models/issueSchema";

const router = express.Router();

router.post(
  "/createIssues",
  [body("link").not().isEmpty(), body("name").not().isEmpty()],
  async (req: Request, res: Response) => {
    try {
      const issues: IIssue[] = req.body.issues;
      const issueDocuments: IIssueDocument[] = issues.map(
        (issue) =>
          new IssueSchema<IIssue>({
            roomId: issue.roomId,
            link: issue.link,
            name: issue.name,
            summary: issue.summary,
            order: issue.order
          })
      );
      const savedIssues: IIssueDocument[] = await IssueSchema.insertMany(
        issueDocuments
      );
      res.json(savedIssues);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send({ message: "Internal server error" });
    }
  }
);

router.get("/getAllIssues/:roomId", async (req: Request, res: Response) => {
  try {
    const issues: IIssue[] = await IssueSchema.find({
      roomId: req.params.roomId
    }).sort({ date: -1 });

    return res.json(issues);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/getIssue/:_id", async (req: Request, res: Response) => {
  try {
    const issue = await IssueSchema.findOne({
      _id: req.params._id
    });

    if (!issue) {
      return res.status(404).send({ message: "Issue not found" });
    }
    return res.json(issue);
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.put("/updateIssue/:_id", async (req, res) => {
  const id = req.params._id;
  const { storyPoints, name, isVoted, isActive } = req.body;

  try {
    const updatedIssue: IIssue | null = await IssueSchema.findByIdAndUpdate(
      id,
      { storyPoints, name, isVoted, isActive },
      { new: true }
    );

    if (updatedIssue) {
      return res.status(200).json({ updatedIssue });
    } else {
      return res.status(404).json({ message: "Issue not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server error" });
  }
});

router.put("/updateIssueStatus/:_id", async (req, res) => {
  const id = req.params._id;
  const { isActive } = req.body;

  try {
    const updatedIssue: IIssue | null = await IssueSchema.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (updatedIssue) {
      return res.status(200).json({ updatedIssue });
    } else {
      return res.status(404).json({ message: "Issue not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server error" });
  }
});

router.put("/updateIssueOrder/:issueId", async (req, res) => {
  try {
    const issueId = req.params.issueId;
    const { newOrder } = req.body;

    const issueToUpdate = await IssueSchema.findById(issueId);
    if (!issueToUpdate) {
      return res.status(404).send({ error: "Issue not found" });
    }

    const roomId = issueToUpdate.roomId;
    const issuesInRoom = await IssueSchema.find({ roomId });

    issuesInRoom.sort((a, b) => a.order! - b.order!);

    const oldOrder = issueToUpdate.order!;
    const direction = newOrder > oldOrder ? -1 : 1;

    for (const issue of issuesInRoom) {
      if (issue.order! <= oldOrder && issue.order! >= newOrder) {
        issue.order! += direction;
        await issue.save();
      } else if (issue.order! === newOrder && issue._id !== issueToUpdate._id) {
        issue.order! = oldOrder;
        await issue.save();
      }
    }

    issueToUpdate.order = newOrder;
    await issueToUpdate.save();

    const updatedIssuesInRoom = await IssueSchema.find({ roomId });

    return res.status(200).json(updatedIssuesInRoom);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

router.delete("/deleteIssues", async (req: Request, res: Response) => {
  try {
    const { issueIds } = req.body;

    for (const issueId of issueIds) {
      const issueToDelete = await IssueSchema.findById(issueId);

      if (!issueToDelete) {
        return res.status(404).send({ error: "Issue does not exist" });
      }

      await issueToDelete.delete();
      const remainingIssues = await IssueSchema.find({
        roomId: issueToDelete.roomId
      }).sort("order");

      let currentOrder = 1;
      for (const issue of remainingIssues) {
        if (issue.order !== currentOrder) {
          const issueNameStripped = issue.name.slice(0, -1);
          issue.order = currentOrder;
          issue.name = issueNameStripped + "" + currentOrder;
          await issue.save();
        }
        currentOrder++;
      }
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting issues", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
