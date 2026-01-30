const authService = require("../services/auth.service");
const logger = require("../utils/logger");

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    logger.info(`User logged in: ${username}`);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    const { token } = req.body;

    await authService.logout(token);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Send OTP
 * @route   POST /api/auth/otp/send
 * @access  Public
 */
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    await authService.sendOTP(phone);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    logger.error(`Send OTP error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/otp/verify
 * @access  Public
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const result = await authService.verifyOTP(phone, otp);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Verify OTP error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/password/reset
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    await authService.resetPassword(email, newPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};
