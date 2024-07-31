const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const PixelSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  char: String,
  color: String,
  timestamp: { type: Date, default: Date.now },
});
const Pixel = mongoose.model("Pixel", PixelSchema);

app.get("/pixels", async (req, res) => {
  try {
    const pixels = await Pixel.find({});
    res.json(pixels);
  } catch (error) {
    console.error("Error fetching pixels:", error);
    res.status(500).send("Error fetching pixels");
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("update pixel", async (pixel) => {
    console.log("Received update pixel:", pixel);

    try {
      const updatedPixel = await Pixel.findOneAndUpdate(
        { x: pixel.x, y: pixel.y },
        { color: pixel.color, char: pixel.char },
        { upsert: true, new: true }
      );
      console.log("Database updated successfully", updatedPixel);

      socket.broadcast.emit("pixel update", pixel);
    } catch (error) {
      console.error("Error updating database:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
