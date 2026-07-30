const cron = require('node-cron');
const prisma = require('../utils/prisma');
const { sendTaskReminderEmail } = require('./emailService');

const sendReminders = async () => {
  try {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
      where: {
        status: { not: 'DONE' },
        dueDate: { not: null, lte: in48h },
      },
      include: {
        project: { select: { id: true, name: true, color: true, ownerId: true } },
      },
    });

    const userTaskMap = new Map();

    for (const task of tasks) {
      const userId = task.assigneeId || task.project.ownerId;
      if (!userTaskMap.has(userId)) userTaskMap.set(userId, []);
      userTaskMap.get(userId).push(task);
    }

    for (const [userId, userTasks] of userTaskMap) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      if (!user) continue;

      for (const task of userTasks) {
        const hoursUntilDue = (new Date(task.dueDate) - now) / (1000 * 60 * 60);
        try {
          await sendTaskReminderEmail({
            to: user.email,
            userName: user.name,
            task,
            project: task.project,
            hoursUntilDue,
          });
          console.log(`Reminder sent to ${user.email} for task: ${task.title}`);
        } catch (emailErr) {
          console.error(`Failed to send reminder for task ${task.id}:`, emailErr.message);
        }
      }
    }
    console.log(`Reminder cron completed. Processed ${tasks.length} tasks.`);
  } catch (err) {
    console.error('Cron job error:', err);
  }
};

const startReminderCron = () => {
  cron.schedule('0 8 * * *', sendReminders, { timezone: 'UTC' });
  console.log('Email reminder cron jobs started');
};

module.exports = { startReminderCron, sendReminders };