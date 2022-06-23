const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    description: {
      type: String,
      default: "I am a great person",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", (next) => {
  console.log(this);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
