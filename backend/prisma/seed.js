const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const p = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  await p.ticketNote.deleteMany({});
  await p.ticket.deleteMany({});
  await p.comment.deleteMany({});
  await p.task.deleteMany({});
  await p.projectMember.deleteMany({});
  await p.project.deleteMany({});
  await p.user.deleteMany({});

  const adminPass = await bcrypt.hash("Admin@1234", 12);
  const managerPass = await bcrypt.hash("Manager@1234", 12);
  const memberPass = await bcrypt.hash("Member@1234", 12);

  const admin = await p.user.create({
    data: { name: "Admin User", email: "admin@taskflow.app", password: adminPass, role: "ADMIN", department: "IT" }
  });

  const manager = await p.user.create({
    data: { name: "Project Manager", email: "manager@taskflow.app", password: managerPass, role: "MANAGER", department: "IT" }
  });

  const member1 = await p.user.create({
    data: { name: "Alice Johnson", email: "alice@taskflow.app", password: memberPass, role: "USER", department: "IT" }
  });

  const member2 = await p.user.create({
    data: { name: "Bob Smith", email: "bob@taskflow.app", password: memberPass, role: "USER", department: "IT" }
  });

  const member3 = await p.user.create({
    data: { name: "Carol White", email: "carol@taskflow.app", password: memberPass, role: "USER", department: "IT" }
  });

  console.log("Users created!");

  const project = await p.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete redesign of company website with modern UI/UX, mobile responsive design and improved performance.",
      color: "#6366f1",
      department: "IT",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      ownerId: manager.id,
      members: {
        create: [
          { userId: manager.id, role: "OWNER" },
          { userId: member1.id, role: "MEMBER" },
          { userId: member2.id, role: "MEMBER" },
          { userId: member3.id, role: "MEMBER" },
        ]
      }
    }
  });

  const tasks = [
    { title: "Design new homepage mockup", description: "Create wireframes and mockups for the new homepage design using Figma.", status: "DONE", priority: "HIGH", assigneeId: member1.id, days: -10 },
    { title: "Setup React project structure", description: "Initialize React project with routing, state management and folder structure.", status: "DONE", priority: "HIGH", assigneeId: member2.id, days: -8 },
    { title: "Build navigation component", description: "Create responsive navigation with mobile hamburger menu.", status: "DONE", priority: "MEDIUM", assigneeId: member1.id, days: -5 },
    { title: "Implement authentication", description: "JWT-based login and registration with role-based access control.", status: "IN_PROGRESS", priority: "URGENT", assigneeId: member2.id, days: 3 },
    { title: "Build dashboard page", description: "Create main dashboard with stats cards, charts and recent activity.", status: "IN_PROGRESS", priority: "HIGH", assigneeId: member3.id, days: 5 },
    { title: "API integration", description: "Connect frontend with backend REST API endpoints.", status: "TODO", priority: "HIGH", assigneeId: member1.id, days: 10 },
    { title: "Mobile responsive testing", description: "Test all pages on mobile devices and fix layout issues.", status: "TODO", priority: "MEDIUM", assigneeId: member3.id, days: 15 },
    { title: "Performance optimization", description: "Optimize images, lazy loading and bundle size.", status: "TODO", priority: "MEDIUM", assigneeId: member2.id, days: 20 },
    { title: "User acceptance testing", description: "Conduct UAT with stakeholders and collect feedback.", status: "TODO", priority: "HIGH", assigneeId: manager.id, days: 25 },
    { title: "Deploy to production", description: "Deploy final version to production server with CI/CD pipeline.", status: "TODO", priority: "URGENT", assigneeId: member2.id, days: 30 },
  ];

  for (const task of tasks) {
    const { days, ...taskData } = task;
    const created = await p.task.create({
      data: { ...taskData, projectId: project.id, dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000) }
    });
    if (task.status === "DONE") {
      await p.comment.create({
        data: { content: "Task completed successfully!", authorId: task.assigneeId, taskId: created.id, isSystem: false }
      });
    }
  }

  console.log("Project and tasks created!");

  await p.ticket.create({
    data: {
      ticketNumber: "TKT-0001",
      name: "John Davis",
      email: "john.davis@company.com",
      department: "Sales & Marketing",
      category: "Software",
      title: "CRM software not loading",
      description: "The CRM software freezes on startup and shows a blank screen. Tried restarting but issue persists.",
      status: "RESOLVED",
      priority: "HIGH",
      assigneeId: member1.id,
      resolution: "Cleared application cache and reinstalled the CRM client. Issue resolved.",
    }
  });

  await p.ticket.create({
    data: {
      ticketNumber: "TKT-0002",
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      department: "Finance & Accounts",
      category: "Access",
      title: "Cannot access shared drive",
      description: "Unable to access the Finance shared drive since this morning. Getting access denied error.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      assigneeId: member2.id,
    }
  });

  await p.ticket.create({
    data: {
      ticketNumber: "TKT-0003",
      name: "Mike Brown",
      email: "mike.brown@company.com",
      department: "HR & Admin",
      category: "Hardware",
      title: "Laptop keyboard not working",
      description: "Several keys on my laptop keyboard stopped working. The F, G, H keys are not responding.",
      status: "OPEN",
      priority: "MEDIUM",
      assigneeId: null,
    }
  });

  console.log("Demo tickets created!");
  console.log("\n✅ Demo data seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("Admin:   admin@taskflow.app    / Admin@1234");
  console.log("Manager: manager@taskflow.app  / Manager@1234");
  console.log("Alice:   alice@taskflow.app    / Member@1234");
  console.log("Bob:     bob@taskflow.app      / Member@1234");
  console.log("Carol:   carol@taskflow.app    / Member@1234");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());