const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addUserToGroup,
  removeUserFromGroup,
} = require("../controllers/chatController");
const protect = require("../middlewares/authMiddleware");
const router = express.Router();

router.route("/").post(protect, accessChat); // for one on one chats
router.get("/", protect, fetchChats);
router
  .route("/groups")
  .post(protect, createGroupChat)
  .put(protect, renameGroup);
router.put("/groups/add", protect, addUserToGroup);
router.put("/groups/remove-user", removeUserFromGroup);

module.exports = router;
