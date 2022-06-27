const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// To retrieve a one on one chat or create one
// @path    POST /api/chats
// @desc    To retrieve a one on one chat or create one
// @scope   Private
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("User ID not provided");
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // checking if chat exists
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json({
        status: true,
        data: fullChat,
        message: "Chat created and retrieved",
      });
    } catch (error) {}
  }
});

// @path    GET /api/chats
// @desc    To retrieve all chats
// @scope   Private
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res
          .status(200)
          .json({ status: true, message: "message retrieved", data: results });
      });
  } catch (error) {
    res.status(400);
    throw new Error("Unable to retrieve chats");
  }
});

// @path    POST /api/chats/groups
// @desc    To create a group chat
// @scope   Private
const createGroupChat = asyncHandler(async (req, res) => {
  var { users, name } = req.body;
  if (!users || !name) {
    res.status(400);
    throw new Error("Please provide users and name");
  }

  users = JSON.parse(req.body.users);
  //   checking if users are at least 2
  if (users < 2) {
    res.status(400);
    throw new Error("Users must be at least 2. Can't be less than 2.");
  }
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res
      .status(201)
      .json({ status: true, message: "Group Created", data: fullGroupChat });
  } catch (error) {}
});

// @path    PUT /api/chats/groups
// @desc    To rename group chat
// @scope   Private
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName) {
    res.status(400);
    throw new Error("Please provide chatId and chatName");
  }
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(400);
    throw new Error("Chat not Found");
  } else {
    res.status(200).json({
      status: true,
      message: "Group renamed successfully",
      data: updatedChat,
    });
  }
});

// @path    PUT /api/chats/groups/add
// @desc    To add a user to the group
// @scope   Private
const addUserToGroup = asyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;
  if (!userId || !chatId) {
    res.status(400);
    throw new Error("Provide user id and chat id");
  }
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(400);
    throw new Error("Chat not found");
  } else {
    res.status(200).json({
      status: true,
      message: "User Added to Chat",
      data: updatedChat,
    });
  }
});

// @path    PUT /api/chats/groups/add
// @desc    To add a user to the group
// @scope   Private
const removeUserFromGroup = asyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;
  if (!userId || !chatId) {
    res.status(400);
    throw new Error("Provide user id and chat id");
  }
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(400);
    throw new Error("Chat not found");
  } else {
    res.status(200).json({
      status: true,
      message: "User Removed from Chat",
      data: updatedChat,
    });
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addUserToGroup,
  removeUserFromGroup,
};
