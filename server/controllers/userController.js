const User = require("../models/User");
const sharp = require("sharp");
const { uploadToS3, deleteFromS3 } = require("../utils/uploadToS3");

const EXCLUDED_FIELDS =
  "-password -refreshTokens -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires";

// GET /api/users/me
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(EXCLUDED_FIELDS);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, location, phone } = req.body;

    // Validation
    if (firstName !== undefined && firstName.trim().length < 2) {
      return res.status(400).json({ success: false, message: "First name must be at least 2 characters" });
    }
    if (lastName !== undefined && lastName.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Last name must be at least 2 characters" });
    }
    if (bio !== undefined && bio.length > 300) {
      return res.status(400).json({ success: false, message: "Bio must be 300 characters or less" });
    }
    if (phone !== undefined && phone !== "" && !/^[\d\s\+\-\(\)]+$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone number format is invalid" });
    }

    // Only allow safe fields
    const allowedUpdates = {};
    if (firstName !== undefined) allowedUpdates.firstName = firstName.trim();
    if (lastName !== undefined) allowedUpdates.lastName = lastName.trim();
    if (bio !== undefined) allowedUpdates.bio = bio;
    if (location !== undefined) allowedUpdates.location = location;
    if (phone !== undefined) allowedUpdates.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).select(EXCLUDED_FIELDS);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/me/photo
const updateProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    // Process with sharp: resize to 400x400, convert to webp, quality 80
    const processedBuffer = await sharp(req.file.buffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    const user = await User.findById(req.user.id);

    // Delete old photo from S3 if it exists
    if (user.profilePhoto && user.profilePhoto !== "") {
      await deleteFromS3(user.profilePhoto);
    }

    // Upload new photo
    const url = await uploadToS3({
      buffer: processedBuffer,
      mimetype: "image/webp",
      folder: "profile-photos",
    });

    user.profilePhoto = url;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      profilePhoto: url,
    });
  } catch (error) {
    if (error.message && error.message.includes("upload")) {
      return res.status(500).json({ success: false, message: "File upload failed, please try again" });
    }
    next(error);
  }
};

// DELETE /api/users/me/photo
const deleteProfilePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.profilePhoto || user.profilePhoto === "") {
      return res.status(400).json({ success: false, message: "No profile photo to delete" });
    }

    await deleteFromS3(user.profilePhoto);

    user.profilePhoto = "";
    await user.save();

    return res.status(200).json({ success: true, message: "Profile photo deleted" });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/me/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "New password must contain at least one number" });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ success: false, message: "New password must be different from current password" });
    }

    user.password = newPassword; // pre-save hook will hash it
    user.refreshTokens = [];     // force re-login on all devices
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed. Please login again." });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id  (public)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "firstName lastName profilePhoto bio location role trustScore averageRating totalRatings createdAt"
    );

    if (!user || user.isBanned) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const publicUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      location: user.location,
      role: user.role,
      trustScore: user.trustScore,
      averageRating: user.averageRating,
      totalRatings: user.totalRatings,
      createdAt: user.createdAt,
    };

    return res.status(200).json({ success: true, user: publicUser });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePhoto,
  deleteProfilePhoto,
  changePassword,
  getUserById,
};
