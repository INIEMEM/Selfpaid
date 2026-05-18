'use strict';

const requireEmailVerified = (req, res, next) => {
  if (!req.user || !req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to access this feature',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
};

module.exports = requireEmailVerified;
