const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const generateJWT = require("../utils/generateJWT");

// @path    /api/users
// @desc    Register User
// @scope   Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Provide name, email and password");
  }

  //   checking if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    pic,
  });

  if (user) {
    res.status(201).json({
      status: true,
      message: "Registration Successful",
      data: { ...user._doc, token: generateJWT(user._id, email) },
    });
  } else {
    res.status(500);
    throw new Error("Error in registering user");
  }
});

// @path    POST /api/users/login
// @desc    Login User
// @scope   Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please Provide Email and Password");
  }

  //   checking if the user exists
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      status: true,
      data: { ...user._doc, token: generateJWT(user._id, email) },
    });
  } else {
    res.status(500);
    throw new Error("Incorrect password");
  }
});

// To retrieve user or search
// @path    GET /api/users
// @desc    Retrieve or Search User
// @scope   Private
const getUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { name: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const user = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(user);
});

module.exports = {
  registerUser,
  loginUser,
  getUsers,
};
