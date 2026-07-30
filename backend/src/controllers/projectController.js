const prisma = require('../utils/prisma');

const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await prisma.project.create({
      data: { ...req.body, ownerId: req.user.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
    });
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found or not authorized' });

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
    });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found or not authorized' });

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getProjectStats = async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: req.params.id },
      _count: { status: true },
    });
    res.json({ stats: tasks });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, getProjectStats };