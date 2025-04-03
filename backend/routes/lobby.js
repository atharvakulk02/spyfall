const WebSocket = require("ws");

let lobbies = {}; // Store lobbies by room code

function setupLobbyHandlers(wss) {
    wss.on("connection", (ws) => {
        console.log("New client connected");

        ws.on("message", (message) => {
            try {
                const data = JSON.parse(message);
                console.log("Received:", data);

                if (data.type === "join_lobby") {
                    const { username, room } = data;
                    ws.username = username; // Store username inside WebSocket instance

                    if (!lobbies[room]) {
                        lobbies[room] = [];
                    }
                    if (!lobbies[room].includes(username)) {
                        lobbies[room].push(username);
                    }

                    console.log(`Lobby ${room}:`, lobbies[room]);

                    const response = JSON.stringify({
                        type: "lobby_update",
                        room,
                        players: lobbies[room],
                    });

                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(response);
                        }
                    });
                }

                if (data.type === "start_game") {
                    const { room } = data;
                    if (lobbies[room] && lobbies[room].length >= 3) {
                        console.log(`Game started in room ${room}`);

                        const players = lobbies[room];
                        const locations = ["Beach", "Restaurant", "Airport", "Library", "Theater"];
                        const location = locations[Math.floor(Math.random() * locations.length)];
                        const spyIndex = Math.floor(Math.random() * players.length);
                        const roles = players.map((player, index) => ({
                            player,
                            role: index === spyIndex ? "Spy" : "Innocent",
                            location: index === spyIndex ? "Unknown" : location
                        }));

                        roles.forEach(({ player, role, location }) => {
                            const response = JSON.stringify({
                                type: "game_started",
                                room,
                                username:player,
                                role,
                                location
                            });

                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN && client.username === player) {
                                    client.send(response);
                                    console.log(`Sent role (${role}) and location (${location}) to ${player}`);
                                }
                            });
                        });
                    }
                }
            } catch (error) {
                console.error("Error handling message:", error);
            }
        });

        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });
}

module.exports = { setupLobbyHandlers };
