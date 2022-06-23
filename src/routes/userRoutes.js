const express = require("express");
const {
  registerUser,
  loginUser,
  getUsers,
} = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");
const router = express.Router();

// user registration
router.route("/").post(registerUser).get(protect, getUsers);
router.post("/login", loginUser);

module.exports = router;
