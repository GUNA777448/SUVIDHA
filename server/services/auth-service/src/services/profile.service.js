const Profile = require("../models/Profile");

class ProfileService {
  // Create new profile
  async createProfile(userId, profileData) {
    try {
      const {
        consumerId,
        mobileNumber,
        aadharNumber,
        fullName,
        email,
        address,
        ...otherData
      } = profileData;

      const profile = await Profile.create({
        userId,
        consumerId,
        mobileNumber,
        aadharNumber,
        fullName,
        email,
        address,
        ...otherData,
      });

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Get profile by userId
  async getProfileByUserId(userId) {
    try {
      const profile = await Profile.findOne({ userId });
      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Get profile by consumerId
  async getProfileByConsumerId(consumerId) {
    try {
      const profile = await Profile.findOne({
        consumerId: consumerId.toUpperCase(),
      });
      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Get profile by mobile number
  async getProfileByMobile(mobileNumber) {
    try {
      const profile = await Profile.findOne({ mobileNumber });
      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Get profile by aadhar
  async getProfileByAadhar(aadharNumber) {
    try {
      const profile = await Profile.findOne({ aadharNumber });
      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Update profile
  async updateProfile(userId, updateData) {
    try {
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!profile) {
        throw new Error("Profile not found");
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // Delete profile
  async deleteProfile(userId) {
    try {
      await Profile.deleteOne({ userId });
      return { message: "Profile deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProfileService();
