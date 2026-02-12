const profileService = require("../services/profile.service");

class ProfileController {
  // Get current user's profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await profileService.getProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update current user's profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Prevent overwriting protected fields
      delete updateData.userId;
      delete updateData._id;
      delete updateData.createdAt;

      const profile = await profileService.updateProfile(userId, updateData);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: profile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get profile by consumer ID
  async getProfileByConsumerId(req, res) {
    try {
      const { consumerId } = req.params;
      const profile = await profileService.getProfileByConsumerId(consumerId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ProfileController();
