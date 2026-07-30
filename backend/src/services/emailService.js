const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const emailTemplate = ({ title, body, ctaText, ctaUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f1f5f9; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 40px auto; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 48px; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 4px; }
    .body { padding: 40px 48px; }
    .greeting { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 24px; }
    .task-card { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
    .task-card .task-title { font-size: 17px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-due { background: #eff6ff; color: #2563eb; }
    .badge-overdue { background: #fef2f2; color: #dc2626; }
    .cta { display: block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; text-align: center; margin: 32px 0; }
    .footer { padding: 24px 48px; border-top: 1px solid #f1f5f9; text-align: center; }
    .footer p { font-size: 13px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>TaskFlow</h1>
        <p>Smart Task Management</p>
      </div>
      <div class="body">
        ${body}
        ${ctaText && ctaUrl ? `<a href="${ctaUrl}" class="cta">${ctaText}</a>` : ''}
      </div>
      <div class="footer">
        <p>You are receiving this because you have an account at TaskFlow.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const sendTaskReminderEmail = async ({ to, userName, task, project, hoursUntilDue }) => {
  const isOverdue = hoursUntilDue < 0;
  const dueDate = new Date(task.dueDate);
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const subject = isOverdue
    ? `Overdue Task: ${task.title}`
    : `Task Due Soon: ${task.title}`;

  const body = `
    <p class="greeting">Hi ${userName},</p>
    <p class="text">
      ${isOverdue
        ? 'You have an overdue task that needs your attention.'
        : 'You have a task due soon - do not let it slip!'
      }
    </p>
    <div class="task-card">
      <div class="task-title">${task.title}</div>
      ${task.description ? `<p style="font-size:14px;color:#64748b;margin-top:6px">${task.description.substring(0, 120)}</p>` : ''}
      <div style="margin-top:12px">
        <span class="badge ${isOverdue ? 'badge-overdue' : 'badge-due'}">
          ${isOverdue ? 'Overdue' : 'Due'}: ${formattedDate}
        </span>
      </div>
    </div>
    <p class="text">Click below to view and update your task.</p>
  `;

  const html = emailTemplate({
    title: subject,
    body,
    ctaText: 'View Task',
    ctaUrl: `${process.env.FRONTEND_URL}/tasks`,
  });

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'TaskFlow <noreply@taskflow.app>',
    to,
    subject,
    html,
  });
};

module.exports = { sendTaskReminderEmail };