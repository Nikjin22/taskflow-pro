const router = require("express").Router();
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/task/:taskId", async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: "Comment cannot be empty" });
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId }, include: { project: { include: { members: true } } } });
    if (!task) return res.status(404).json({ error: "Task not found" });
    const isMember = task.project.members.some(m => m.userId === req.user.id);
    const isOwner = task.project.ownerId === req.user.id;
    const isAdmin = ["ADMIN","MANAGER"].includes(req.user.role);
    if (!isMember && !isOwner && !isAdmin) return res.status(403).json({ error: "Not authorized" });
    const comment = await prisma.comment.create({
      data: { content: content.trim(), authorId: req.user.id, taskId: req.params.taskId },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
    res.status(201).json({ comment });
  } catch (err) { next(err); }
});

router.post("/project/:projectId", async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: "Comment cannot be empty" });
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId }, include: { members: true } });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const isMember = project.members.some(m => m.userId === req.user.id);
    const isOwner = project.ownerId === req.user.id;
    const isAdmin = ["ADMIN","MANAGER"].includes(req.user.role);
    if (!isMember && !isOwner && !isAdmin) return res.status(403).json({ error: "Not authorized" });
    const comment = await prisma.comment.create({
      data: { content: content.trim(), authorId: req.user.id, projectId: req.params.projectId },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
    res.status(201).json({ comment });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.authorId !== req.user.id && !["ADMIN","MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: "Comment deleted" });
  } catch (err) { next(err); }
});

module.exports = router;