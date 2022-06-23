const jwt = require("jsonwebtoken");

const generateJWT = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
module.exports = generateJWT;
