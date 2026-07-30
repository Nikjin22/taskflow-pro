const router = require("express").Router();
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");

// Generate ticket number
async function generateTicketNumber() {
  const count = await prisma.ticket.count();
  return "TKT-" + String(count + 1).padStart(4, "0");
}

// PUBLIC - Submit a ticket (no auth needed)
router.post("/submit", async (req, res, next) => {
  try {
    const { name, email, department, category, title, description } = req.body;
    if (!name || !email || !department || !category || !title || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    const ticketNumber = await generateTicketNumber();
    const ticket = await prisma.ticket.create({
      data: { ticketNumber, name, email, department, category, title, description, status: "OPEN", priority: "MEDIUM" },
    });
    res.status(201).json({ ticket, ticketNumber: ticket.ticketNumber });
  } catch (err) { next(err); }
});

// PUBLIC - Track tickets by email (no auth needed)
router.get("/track/:email", async (req, res, next) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const tickets = await prisma.ticket.findMany({
      where: { email },
      include: {
        assignee: { select: { id: true, name: true } },
        notes: {
          where: { isInternal: false },
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ tickets });
  } catch (err) { next(err); }
});

// PROTECTED - Get all tickets (IT team only)
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;
    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
    };
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true } },
        notes: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { notes: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const stats = {
      total: await prisma.ticket.count(),
      open: await prisma.ticket.count({ where: { status: "OPEN" } }),
      inProgress: await prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      resolved: await prisma.ticket.count({ where: { status: "RESOLVED" } }),
      closed: await prisma.ticket.count({ where: { status: "CLOSED" } }),
    };
    res.json({ tickets, stats });
  } catch (err) { next(err); }
});

// PROTECTED - Get single ticket
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true } },
        notes: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json({ ticket });
  } catch (err) { next(err); }
});

// PROTECTED - Update ticket (assign, change status, priority, resolution)
router.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const { status, priority, assigneeId, resolution } = req.body;
    const oldTicket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!oldTicket) return res.status(404).json({ error: "Ticket not found" });

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(resolution !== undefined && { resolution }),
      },
      include: {
        assignee: { select: { id: true, name: true } },
        notes: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Auto system note for status change
    if (status && status !== oldTicket.status) {
      await prisma.ticketNote.create({
        data: {
          content: "Status changed from " + oldTicket.status.replace("_"," ") + " to " + status.replace("_"," "),
          isInternal: false,
          authorId: req.user.id,
          ticketId: req.params.id,
        },
      });
    }

    // Auto system note for assignment
    if (assigneeId && assigneeId !== oldTicket.assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { name: true } });
      await prisma.ticketNote.create({
        data: {
          content: "Ticket assigned to " + (assignee?.name || "team member"),
          isInternal: false,
          authorId: req.user.id,
          ticketId: req.params.id,
        },
      });
    }

    res.json({ ticket });
  } catch (err) { next(err); }
});

// PROTECTED - Add note to ticket
router.post("/:id/notes", authenticate, async (req, res, next) => {
  try {
    const { content, isInternal } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: "Note cannot be empty" });
    const note = await prisma.ticketNote.create({
      data: {
        content: content.trim(),
        isInternal: isInternal || false,
        authorId: req.user.id,
        ticketId: req.params.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    res.status(201).json({ note });
  } catch (err) { next(err); }
});

// PROTECTED - Delete ticket
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await prisma.ticket.delete({ where: { id: req.params.id } });
    res.json({ message: "Ticket deleted" });
  } catch (err) { next(err); }
});


// Get tickets assigned to me
router.get("/assigned/me", authenticate, async (req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { assigneeId: req.user.id },
      include: {
        assignee: { select: { id: true, name: true } },
        notes: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ tickets });
  } catch (err) { next(err); }
});

module.exports = router;