const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const tasks = await p.task.findMany({ orderBy: { createdAt: "asc" } });
  console.log("Updating", tasks.length, "tasks...");
  
  for (let i = 0; i < tasks.length; i++) {
    const daysFromNow = i * 2;
    await p.task.update({
      where: { id: tasks[i].id },
      data: { dueDate: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000) }
    });
    process.stdout.write(".");
  }
  console.log("\nAll deadlines updated from today!");
}

main().catch(console.error).finally(() => p.$disconnect());