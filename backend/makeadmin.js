const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.user.updateMany({
  where: { email: "demo@taskflow.app" },
  data: { role: "ADMIN" }
}).then(r => {
  console.log("Done! Updated:", r.count, "user(s)");
  p.$disconnect();
}).catch(e => {
  console.error(e);
  p.$disconnect();
});