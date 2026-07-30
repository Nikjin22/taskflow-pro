const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  console.log("Cleaning up...");
  await p.comment.deleteMany({});
  await p.task.deleteMany({});
  await p.projectMember.deleteMany({});
  await p.project.deleteMany({});
  console.log("All projects and tasks deleted!");
  console.log("System is clean and ready for real projects.");
}

main().catch(console.error).finally(() => p.$disconnect());