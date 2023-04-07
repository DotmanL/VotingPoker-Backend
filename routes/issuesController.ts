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

router.put("/updateIssue/:_id", async (req, res) => {
  const id = req.params._id;
  const { storyPoints, name, isVoted } = req.body;

  try {
    const updatedIssue: IIssue | null = await IssueSchema.findByIdAndUpdate(
      id,
      { storyPoints, name, isVoted },
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

    issueToUpdate.order = newOrder;
    await issueToUpdate.save();

    let order = 1;
    for (const issue of issuesInRoom) {
      if (issue._id === issueToUpdate._id) {
        continue;
      }
      if (order === newOrder) {
        order++;
      }
      issue.order = order;
      await issue.save();
      order++;
    }

    res.send({ message: "Issue order updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

router.delete("/deleteIssue/:_id", async (req: Request, res: Response) => {
  try {
    const result = await IssueSchema.deleteOne({ _id: req.params._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Issue not found" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting Issue", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/deleteIssues/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  try {
    const result = await IssueSchema.deleteMany({ roomId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Issues not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting issues", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
