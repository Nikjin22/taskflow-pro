require("dotenv").config();
const app = require("./app");
const { startReminderCron } = require("./services/cronService");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("TaskFlow backend running on port " + PORT);
  startReminderCron();
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});