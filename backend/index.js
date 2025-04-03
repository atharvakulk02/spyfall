const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const { setupLobbyHandlers } = require("./routes/lobby");

const app = express();
const PORT = process.env.PORT || 5000;

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../spyfall_frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../spyfall_frontend/build", "index.html"));
});

// Create an HTTP server and attach WebSocket to it
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

console.log(`Server running on port ${PORT}`);
setupLobbyHandlers(wss);

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`HTTP & WebSocket server running on port ${PORT}`);
});
