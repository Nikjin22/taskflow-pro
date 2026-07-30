const router = require("express").Router();
const prisma = require("../utils/prisma");
const bcrypt = require("bcryptjs");
const { authenticate } = require("../middleware/auth");

const requireAdmin = (req, res, next) => {
  if (!["ADMIN", "MANAGER"].includes(req.user?.role)) {
    return res.status(403).json({ error: "Access required" });
  }
  next();
};

router.use(authenticate, requireAdmin);

router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        department: true, isActive: true, createdAt: true,
        _count: { select: { projects: true, assignedTasks: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch (err) { next(err); }
});

router.post("/users", async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Only admins can create users" });
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password required" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "USER", department: department || "IT" },
      select: { id: true, name: true, email: true, role: true, department: true, isActive: true, createdAt: true },
    });
    res.status(201).json({ user });
  } catch (err) { next(err); }
});

router.patch("/users/:id", async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Only admins can edit users" });
    const { name, role, department, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(department !== undefined && { department }),
        ...(isActive !== undefined && { isActive }),
      },
      select: { id: true, name: true, email: true, role: true, department: true, isActive: true },
    });
    res.json({ user });
  } catch (err) { next(err); }
});

router.patch("/users/:id/password", async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Only admins can reset passwords" });
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashed } });
    res.json({ message: "Password reset successfully" });
  } catch (err) { next(err); }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Only admins can delete users" });
    if (req.params.id === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) { next(err); }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [totalUsers, totalProjects, totalTasks, totalAdmins, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.user.count({ where: { role: { in: ["ADMIN"] } } }),
      prisma.user.count({ where: { isActive: true } }),
    ]);
    res.json({ totalUsers, totalProjects, totalTasks, totalAdmins, activeUsers });
  } catch (err) { next(err); }
});

router.get("/reports/departments", async (req, res, next) => {
  try {
    const departments = ["IT"];
    const report = await Promise.all(departments.map(async (dept) => {
      const [users, projects, tasks] = await Promise.all([
        prisma.user.count({ where: { department: dept } }),
        prisma.project.count({ where: { department: dept } }),
        prisma.task.count({ where: { project: { department: dept } } }),
      ]);
      return { department: dept, users, projects, tasks };
    }));
    res.json({ report });
  } catch (err) { next(err); }
});

module.exports = router;