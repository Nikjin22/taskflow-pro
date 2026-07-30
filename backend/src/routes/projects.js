const router = require("express").Router();
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

// Get all projects (filtered by role)
router.get("/", async (req, res, next) => {
  try {
    const isPrivileged = ["ADMIN", "MANAGER"].includes(req.user.role);
    const where = isPrivileged ? {} : {
      members: { some: { userId: req.user.id } }
    };
    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, role: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ projects });
  } catch (err) { next(err); }
});

// Get single project
router.get("/:id", async (req, res, next) => {
  try {
    const isPrivileged = ["ADMIN", "MANAGER"].includes(req.user.role);
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, role: true, email: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true } },
            comments: { include: { author: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } },
          },
          orderBy: { createdAt: "asc" },
        },
        comments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const isMember = project.members.some(m => m.userId === req.user.id);
    if (!isPrivileged && !isMember) return res.status(403).json({ error: "Access denied" });
    res.json({ project });
  } catch (err) { next(err); }
});

// Create project
router.post("/", async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) return res.status(403).json({ error: "Only managers can create projects" });
    const { name, description, color, dueDate, memberIds } = req.body;
    if (!name) return res.status(400).json({ error: "Project name is required" });
    const members = [
      { userId: req.user.id, role: "OWNER" },
      ...(memberIds || []).filter(id => id !== req.user.id).map(id => ({ userId: id, role: "MEMBER" })),
    ];
    const project = await prisma.project.create({
      data: {
        name, description, color: color || "#E8382D",
        dueDate: dueDate ? new Date(dueDate) : null,
        ownerId: req.user.id,
        department: "IT",
        members: { create: members },
      },
      include: {
        owner: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true } } } },
        _count: { select: { tasks: true } },
      },
    });
    res.status(201).json({ project });
  } catch (err) { next(err); }
});

// Update project
router.put("/:id", async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) return res.status(403).json({ error: "Not authorized" });
    const { name, description, color, status, priority, dueDate, memberIds } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        owner: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true } } } },
        _count: { select: { tasks: true } },
      },
    });
    if (memberIds) {
      await prisma.projectMember.deleteMany({ where: { projectId: req.params.id, role: "MEMBER" } });
      const newMembers = memberIds.filter(id => id !== project.ownerId).map(id => ({ projectId: req.params.id, userId: id, role: "MEMBER" }));
      if (newMembers.length > 0) await prisma.projectMember.createMany({ data: newMembers, skipDuplicates: true });
    }
    res.json({ project });
  } catch (err) { next(err); }
});

// Delete project
router.delete("/:id", async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) return res.status(403).json({ error: "Not authorized" });
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: "Project deleted" });
  } catch (err) { next(err); }
});

// Add member
router.post("/:id/members", async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) return res.status(403).json({ error: "Not authorized" });
    const { userId } = req.body;
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: req.params.id, userId } },
      update: {},
      create: { projectId: req.params.id, userId, role: "MEMBER" },
    });
    res.json({ message: "Member added" });
  } catch (err) { next(err); }
});

// Remove member
router.delete("/:id/members/:userId", async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) return res.status(403).json({ error: "Not authorized" });
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
    });
    res.json({ message: "Member removed" });
  } catch (err) { next(err); }
});

module.exports = router;