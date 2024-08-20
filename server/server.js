// Run this to test out socketio connections

const express = require("express");

const app = express();
app.use(express.static(__dirname + "/.."));

const server = app.listen(4001, () => {
  console.log(`App started on port ${server.address().port}`);
});

const clients = new Set();

const io = require("socket.io")(server);
io.on("connection", client => {
  clients.add(client);
  
  client.on("disconnect", () => {
    clients.delete(client);
  });

  client.on("message", msg => {
    for (const c of clients) {
      c.send(msg);
    }
    
    if (!JSON.parse(msg).header.tags?.split(",")?.includes("hb")) console.log(JSON.parse(msg).data)
  })
});

app.get("/", (req,res) => {
  res.sendFile(__dirname + "/index.html");
});
