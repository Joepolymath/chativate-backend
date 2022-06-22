const express = require("express");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const chats = require("./data/data");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(morgan("tiny"));
app.use(cors());
app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/api/chat", (req, res) => {
  res.send(chats);
});

app.get("/api/chat/:id", (req, res) => {
  const id = req.params.id;
  const chat = chats.find((chat) => chat._id === id);
  res.send(chat);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
