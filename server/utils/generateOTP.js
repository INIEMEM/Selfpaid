'use strict';

const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit OTP string.
 * Uses crypto.randomInt for uniform distribution — no modulo bias.
 * Range: 100000–999999 inclusive.
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports = generateOTP;
