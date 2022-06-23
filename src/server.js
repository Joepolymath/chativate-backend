const express = require("express");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const colors = require("colors");

const chats = require("./data/data");
const connectDB = require("./config/db.config");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5001;

// connecting to db
connectDB();

// middlewares
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));

// introducing error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`.bgBlue.black);
});
