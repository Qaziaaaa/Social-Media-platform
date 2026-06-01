const { exec } = require("child_process");

const PORT = process.argv[2] || "4000";

exec("netstat -ano", (_err, stdout) => {
  const lines = stdout.split("\n").filter(
    (l) => l.includes(`:${PORT} `) && l.includes("LISTENING"),
  );
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== "0") {
      try {
        process.kill(parseInt(pid));
        console.log(`Killed PID ${pid} on port ${PORT}`);
      } catch {
        // process already dead
      }
    }
  }
});
