const prisma = require('../utils/prisma');

const hasProjectAccess = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
  });
  return !!project;
};

const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, dueDate, search } = req.query;
    const where = {};

    if (projectId) {
      const access = await hasProjectAccess(projectId, req.user.id);
      if (!access) return res.status(403).json({ error: 'Access denied' });
      where.projectId = projectId;
    } else {
      where.project = {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      };
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dueDate === 'overdue') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'DONE' };
    } else if (dueDate === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.dueDate = { gte: today, lt: tomorrow };
    } else if (dueDate === 'week') {
      const today = new Date();
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      where.dueDate = { gte: today, lte: weekEnd };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: { select: { id: true, name: true, color: true, ownerId: true } },
      },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const access = await hasProjectAccess(task.projectId, req.user.id);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const access = await hasProjectAccess(projectId, req.user.id);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    const task = await prisma.task.create({
      data: { ...req.body, projectId },
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const access = await hasProjectAccess(task.projectId, req.user.id);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
    });
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const access = await hasProjectAccess(task.projectId, req.user.id);
    if (!access) return res.status(403).json({ error: 'Access denied' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectFilter = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    };

    const [totalProjects, totalTasks, tasksByStatus, overdueTasks, upcomingTasks, recentActivity] =
      await Promise.all([
        prisma.project.count({ where: projectFilter }),
        prisma.task.count({ where: { project: projectFilter } }),
        prisma.task.groupBy({
          by: ['status'],
          where: { project: projectFilter },
          _count: { status: true },
        }),
        prisma.task.findMany({
          where: {
            project: projectFilter,
            dueDate: { lt: new Date() },
            status: { not: 'DONE' },
          },
          include: { project: { select: { id: true, name: true, color: true } } },
          orderBy: { dueDate: 'asc' },
          take: 5,
        }),
        prisma.task.findMany({
          where: {
            project: projectFilter,
            dueDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            status: { not: 'DONE' },
          },
          include: { project: { select: { id: true, name: true, color: true } } },
          orderBy: { dueDate: 'asc' },
          take: 5,
        }),
        prisma.task.findMany({
          where: { project: projectFilter },
          include: { project: { select: { id: true, name: true, color: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
      ]);

    res.json({
      stats: { totalProjects, totalTasks, tasksByStatus, overdueTasks: overdueTasks.length },
      overdueTasks,
      upcomingTasks,
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getDashboard };