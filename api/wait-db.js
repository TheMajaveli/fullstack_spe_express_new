const net = require("net");
const host = process.env.DB_HOST || "mysql";
const port = parseInt(process.env.DB_PORT || "3306", 10);
const maxWait = 60000;
const interval = 2000;
const start = Date.now();

function tryConnect() {
  if (Date.now() - start > maxWait) {
    console.error("Timeout waiting for MySQL");
    process.exit(1);
  }
  const socket = new net.Socket();
  socket.setTimeout(5000);
  socket.on("connect", () => {
    socket.destroy();
    process.exit(0);
  });
  socket.on("error", () => setTimeout(tryConnect, interval));
  socket.on("timeout", () => {
    socket.destroy();
    setTimeout(tryConnect, interval);
  });
  socket.connect(port, host);
}
tryConnect();
