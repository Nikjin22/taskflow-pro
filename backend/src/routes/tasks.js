const router = require("express").Router();
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const isPrivileged = ["ADMIN", "MANAGER"].includes(req.user.role);
    const { projectId, status, priority } = req.query;
    const where = {
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(!isPrivileged && { assigneeId: req.user.id }),
    };
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        comments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ tasks });
  } catch (err) { next(err); }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const isPrivileged = ["ADMIN", "MANAGER"].includes(req.user.role);
    const userFilter = isPrivileged ? {} : { assigneeId: req.user.id };
    const projectFilter = isPrivileged ? {} : { members: { some: { userId: req.user.id } } };
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [totalProjects, totalTasks, overdueTasks, tasksByStatus, overdue, upcoming] = await Promise.all([
      prisma.project.count({ where: projectFilter }),
      prisma.task.count({ where: userFilter }),
      prisma.task.count({ where: { ...userFilter, dueDate: { lt: now }, status: { not: "DONE" } } }),
      prisma.task.groupBy({ by: ["status"], where: userFilter, _count: { status: true } }),
      prisma.task.findMany({
        where: { ...userFilter, dueDate: { lt: now }, status: { not: "DONE" } },
        include: { assignee: { select: { id: true, name: true } }, project: { select: { id: true, name: true, color: true } } },
        orderBy: { dueDate: "asc" }, take: 5,
      }),
      prisma.task.findMany({
        where: { ...userFilter, dueDate: { gte: now, lte: weekEnd }, status: { not: "DONE" } },
        include: { assignee: { select: { id: true, name: true } }, project: { select: { id: true, name: true, color: true } } },
        orderBy: { dueDate: "asc" }, take: 5,
      }),
    ]);
    res.json({ stats: { totalProjects, totalTasks, overdueTasks, tasksByStatus }, overdueTasks: overdue, upcomingTasks: upcoming });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        comments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ task });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) return res.status(403).json({ error: "Only managers can create tasks" });
    const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;
    if (!title || !projectId) return res.status(400).json({ error: "Title and project are required" });
    const task = await prisma.task.create({
      data: {
        title, description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        comments: { include: { author: { select: { id: true, name: true, role: true } } } },
      },
    });
    if (assigneeId) {
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId, userId: assigneeId } },
        update: {},
        create: { projectId, userId: assigneeId, role: "MEMBER" },
      });
    }
    res.status(201).json({ task });
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const isPrivileged = ["ADMIN", "MANAGER"].includes(req.user.role);
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { members: true } } }
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const isAssignee = task.assigneeId === req.user.id;
    const isMember = task.project.members.some(m => m.userId === req.user.id);

    if (!isPrivileged && !isAssignee && !isMember) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    // Team members can only update status
    if (!isPrivileged) {
      if (!status) return res.status(400).json({ error: "Team members can only update status" });
      const oldStatus = task.status;
      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          assignee: { select: { id: true, name: true } },
          project: { select: { id: true, name: true, color: true } },
          comments: {
            include: { author: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      // Auto-add system comment for status change
      await prisma.comment.create({
        data: {
          content: "Status changed from " + oldStatus.replace("_"," ") + " to " + status.replace("_"," "),
          authorId: req.user.id,
          taskId: req.params.id,
          isSystem: true,
        }
      });
      return res.json({ task: updated });
    }

    // Manager/Admin can update everything
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        comments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    res.json({ task: updated });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) return res.status(403).json({ error: "Not authorized" });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: "Task deleted" });
  } catch (err) { next(err); }
});

router.post("/:id/comments", async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: "Comment cannot be empty" });
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { members: true } } },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    const isMember = task.project.members.some(m => m.userId === req.user.id);
    const isPrivileged = ["ADMIN", "MANAGER"].includes(req.user.role);
    if (!isMember && !isPrivileged) return res.status(403).json({ error: "Not a project member" });
    const comment = await prisma.comment.create({
      data: { content: content.trim(), authorId: req.user.id, taskId: req.params.id },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
    res.status(201).json({ comment });
  } catch (err) { next(err); }
});

module.exports = router;