const authService = require("../services/auth.service");

class AuthController {
  // Get OTP - generates, saves to DB & sends email in parallel
  async requestOTP(req, res) {
    try {
      const { identifier, loginType } = req.body;

      const result = await authService.requestOTP(identifier, loginType);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          expiresIn: result.expiresIn,
          emailSent: result.emailSent,
          otp: result.otp, // Only in development
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Verify OTP and login
  async verifyOTP(req, res) {
    try {
      const { identifier, loginType, otp } = req.body;

      const result = await authService.verifyOTP(identifier, loginType, otp);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const userId = req.user.id;

      const result = await authService.logout(userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await authService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Health check
  async health(req, res) {
    res.status(200).json({
      success: true,
      message: "Auth service is running",
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new AuthController();
