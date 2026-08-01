const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const p = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Demo@1234", 12);
  
  // Check if demo user exists
  const existing = await p.user.findUnique({ where: { email: "demo@taskflow.app" } });
  
  if (existing) {
    await p.user.update({
      where: { email: "demo@taskflow.app" },
      data: { role: "USER", name: "Demo User" }
    });
    console.log("Demo user updated to USER role!");
  } else {
    await p.user.create({
      data: {
        name: "Demo User",
        email: "demo@taskflow.app",
        password,
        role: "USER",
        department: "IT",
        isActive: true,
      }
    });
    console.log("Demo user created!");
  }

  // Add demo user to all projects so they can view
  const projects = await p.project.findMany();
  const demoUser = await p.user.findUnique({ where: { email: "demo@taskflow.app" } });
  
  for (const project of projects) {
    await p.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: demoUser.id } },
      update: {},
      create: { projectId: project.id, userId: demoUser.id, role: "MEMBER" }
    });
  }

  console.log("Demo user added to all projects!");
  console.log("Demo login: demo@taskflow.app / Demo@1234");
  console.log("Role: USER (view only - cannot create/delete/edit)");
}

main().catch(console.error).finally(() => p.$disconnect());