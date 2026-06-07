const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Check MONGO_URI in server/.env and confirm the Atlas cluster hostname is correct.");
    process.exit(1);
  }
};

module.exports = connectDB;
