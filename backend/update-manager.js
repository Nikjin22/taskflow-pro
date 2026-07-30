const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const p = new PrismaClient();

async function main() {
  // Delete Rahul
  await p.user.deleteMany({ where: { email: "rahul@flamingopharma.com" } });
  console.log("Rahul removed!");

  // Create generic Manager account
  const password = await bcrypt.hash("Manager@1234", 12);
  await p.user.create({
    data: {
      name: "Manager",
      email: "manager@flamingopharma.com",
      password: password,
      role: "MANAGER",
      department: "IT",
      isActive: true,
    }
  });
  console.log("Manager account created!");
  console.log("Email: manager@flamingopharma.com");
  console.log("Password: Manager@1234");
}

main().catch(console.error).finally(() => p.$disconnect());