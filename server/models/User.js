const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ["worker", "creator", "admin"],
      default: "worker",
    },
    profilePhoto: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 300 },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    emailOTP: { type: String, default: null },
    emailOTPExpires: { type: Date, default: null },
    emailOTPAttempts: { type: Number, default: 0 },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    refreshTokens: [{ type: String }],
    trustScore: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    escrowBalance: { type: Number, default: 0 },
    tokenBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual: fullName
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook: hash password if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method: comparePassword
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method: getFullName
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
