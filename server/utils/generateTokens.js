const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
};

const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = { generateAccessToken, generateRefreshToken, generateRandomToken };
