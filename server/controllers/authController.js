const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
} = require('../utils/generateTokens');
const generateOTP = require('../utils/generateOTP');
const {
  otpEmailTemplate,
  resendOTPTemplate,
  passwordResetEmailTemplate,
} = require('../utils/emailTemplates');
const jwt = require('jsonwebtoken');

// ─── Validation Helpers ───────────────────────────────────────────────────────

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterInput = ({ firstName, lastName, email, password, role }) => {
  if (!firstName || firstName.trim().length < 2)
    return "First name must be at least 2 characters";
  if (!lastName || lastName.trim().length < 2)
    return "Last name must be at least 2 characters";
  if (!email || !emailRegex.test(email))
    return "Please provide a valid email address";
  if (!password || password.length < 8)
    return "Password must be at least 8 characters";
  if (!/\d/.test(password))
    return "Password must contain at least one number";
  if (!role || !["worker", "creator"].includes(role))
    return "Role must be either worker or creator";
  return null;
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const validationError = validateRegisterInput({ firstName, lastName, email, password, role });
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = new User({ firstName, lastName, email, password, role });

  // OTP email verification
  const otp = generateOTP();
  user.emailOTP = otp;
  user.emailOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  user.emailOTPAttempts = 0;

  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your SelfPaid account',
      html: otpEmailTemplate(user.firstName, otp),
    });
  } catch (err) {
    console.error('OTP email failed to send:', err.message);
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens.push(refreshToken);
  await user.save();

  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for a 6-digit verification code.',
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address" });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (user.isBanned) {
    return res.status(403).json({ success: false, message: "Account has been banned" });
  }

  if (user.isSuspended) {
    return res.status(403).json({ success: false, message: "Account has been suspended" });
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Keep max 5 refresh tokens
  user.refreshTokens.push(refreshToken);
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  await user.save();

  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profilePhoto: user.profilePhoto,
      walletBalance: user.walletBalance,
    },
    accessToken,
  });
};

const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const user = await User.findOne({ refreshTokens: token });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      await user.save();
    }
  }

  res.clearCookie("refreshToken");

  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokens.includes(token)) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  setRefreshCookie(res, newRefreshToken);

  return res.status(200).json({ success: true, accessToken: newAccessToken });
};

// ─── verifyOTP ────────────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ success: false, message: 'Email already verified' });
  }

  if (!user.emailOTPExpires || user.emailOTPExpires < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  // Increment attempt count before checking
  user.emailOTPAttempts += 1;
  await user.save();

  if (user.emailOTPAttempts > 5) {
    return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
  }

  if (user.emailOTP !== String(otp)) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  user.isEmailVerified = true;
  user.emailOTP = null;
  user.emailOTPExpires = null;
  user.emailOTPAttempts = 0;
  await user.save();

  return res.status(200).json({ success: true, message: 'Email verified successfully' });
};

// ─── resendOTP ────────────────────────────────────────────────────────────────
const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    // Don't reveal whether email exists
    return res.status(200).json({ success: true, message: 'New OTP sent to your email' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Security: same response whether found or not
    return res.status(200).json({ success: true, message: 'New OTP sent to your email' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ success: false, message: 'Email already verified' });
  }

  // Rate limit: no more than one OTP per 60 seconds
  if (user.emailOTPExpires) {
    const issuedAt = user.emailOTPExpires.getTime() - 15 * 60 * 1000;
    const secondsSinceIssue = (Date.now() - issuedAt) / 1000;
    if (secondsSinceIssue < 60) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting a new code',
      });
    }
  }

  const otp = generateOTP();
  user.emailOTP = otp;
  user.emailOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
  user.emailOTPAttempts = 0;
  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your new SelfPaid verification code',
      html: resendOTPTemplate(user.firstName, otp),
    });
  } catch (err) {
    console.error('Resend OTP email failed:', err.message);
  }

  return res.status(200).json({ success: true, message: 'New OTP sent to your email' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() });

  if (user) {
    const resetToken = generateRandomToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your password – Global Task Platform",
        html: passwordResetEmailTemplate(user.firstName, resetUrl),
      });
    } catch (err) {
      console.error("Password reset email failed to send:", err.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: "If that email exists, a reset link has been sent",
  });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }
  if (!/\d/.test(password)) {
    return res.status(400).json({ success: false, message: "Password must contain at least one number" });
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.refreshTokens = [];
  await user.save();

  return res.status(200).json({ success: true, message: "Password reset successful. Please login." });
};

const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe,
};
