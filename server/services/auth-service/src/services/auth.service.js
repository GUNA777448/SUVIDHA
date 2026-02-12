const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const profileService = require("./profile.service");
const auditService = require("./audit.service");
const axios = require("axios");

class AuthService {
  // Request OTP for login
  async requestOTP(identifier, loginType) {
    try {
      // Validate input
      if (!identifier || !loginType) {
        throw new Error("Identifier and login type are required");
      }

      // Validate login type
      if (!["M", "A", "C"].includes(loginType)) {
        throw new Error("Invalid login type. Use M, A, or C");
      }

      // Validate identifier format based on login type
      if (loginType === "M" && !/^[0-9]{10}$/.test(identifier)) {
        throw new Error("Mobile number must be 10 digits");
      }
      if (loginType === "A" && !/^[0-9]{12}$/.test(identifier)) {
        throw new Error("Aadhar number must be 12 digits");
      }

      // Delete any existing OTPs for this identifier
      await OTP.deleteMany({ identifier, loginType });

      // Generate random 6-digit OTP
      const otpValue = String(Math.floor(100000 + Math.random() * 900000));
      const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Look up user details (consumerId, email, name) for sending OTP
      let consumerId = null;
      let userEmail = null;
      let userName = null;

      const existingUser = await this.findUserByIdentifier(
        identifier,
        loginType,
      );

      if (existingUser) {
        consumerId = existingUser.consumerId;

        // Fetch profile to get email and name
        try {
          const profile = await profileService.getProfileByUserId(
            existingUser._id,
          );
          if (profile) {
            userEmail = profile.email;
            userName = profile.fullName;
          }
        } catch (err) {
          console.warn(`⚠️ Could not fetch profile for user: ${err.message}`);
        }
      }

      // Run DB save and email send in PARALLEL
      const dbSavePromise = OTP.create({
        identifier,
        loginType,
        consumerId,
        otp: otpValue,
        expiresAt,
      });

      let emailPromise = Promise.resolve({ skipped: true });
      if (userEmail) {
        emailPromise = this.sendOTPViaAppsScript(
          userEmail,
          userName || "User",
          otpValue,
        ).catch((err) => {
          console.error(`❌ Failed to send OTP email: ${err.message}`);
          return { error: err.message };
        });
      }

      // Wait for both to complete in parallel
      const [otpDoc, emailResult] = await Promise.all([
        dbSavePromise,
        emailPromise,
      ]);

      const emailSent = !emailResult.skipped && !emailResult.error;

      console.log(
        `📱 OTP generated for ${identifier} (Type: ${loginType}): ${otpValue}`,
      );
      if (emailSent) {
        console.log(`📧 OTP email sent to ${userEmail}`);
      } else if (!userEmail) {
        console.warn(`⚠️ No email found for ${identifier}, OTP not emailed`);
      }

      // Audit log
      auditService.log("OTP_REQUESTED", {
        identifier,
        loginType,
        userId: existingUser?._id,
        details: { emailSent },
      });

      return {
        message: emailSent
          ? "OTP sent successfully to your registered email"
          : "OTP generated successfully (no email on file)",
        expiresIn: expiryMinutes,
        emailSent,
        // In development, include OTP in response for testing
        otp: process.env.NODE_ENV === "development" ? otpValue : undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP and login
  async verifyOTP(identifier, loginType, otp) {
    try {
      // Find OTP record for this identifier (regardless of otp value)
      const otpRecord = await OTP.findOne({
        identifier,
        loginType,
        verified: false,
      });

      if (!otpRecord) {
        throw new Error("Invalid or expired OTP");
      }

      // Check if OTP is locked due to too many attempts
      if (otpRecord.locked) {
        auditService.log("OTP_LOCKED", {
          identifier,
          loginType,
          success: false,
        });
        throw new Error(
          "OTP locked due to too many failed attempts. Please request a new OTP.",
        );
      }

      // Check if OTP is expired
      if (otpRecord.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        throw new Error("OTP has expired");
      }

      // Check if max attempts exceeded
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        otpRecord.locked = true;
        await otpRecord.save();
        throw new Error(
          "Maximum verification attempts exceeded. Please request a new OTP.",
        );
      }

      // Increment attempt counter
      otpRecord.attempts += 1;

      // Check if OTP matches
      if (otpRecord.otp !== otp) {
        await otpRecord.save();
        const remaining = otpRecord.maxAttempts - otpRecord.attempts;
        auditService.log("OTP_FAILED", {
          identifier,
          loginType,
          success: false,
          details: { attemptsUsed: otpRecord.attempts, remaining },
        });
        throw new Error(
          `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
        );
      }

      // Mark OTP as verified
      otpRecord.verified = true;
      await otpRecord.save();

      // Find or create user
      let user = await this.findUserByIdentifier(identifier, loginType);

      if (!user) {
        // Create new user
        user = await this.createUser(identifier, loginType);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      // Clean up OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      // Audit log
      auditService.log("LOGIN_SUCCESS", {
        userId: user._id,
        identifier,
        loginType,
      });

      return {
        user: user.toAuthJSON(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // Send OTP via Google Apps Script
  async sendOTPViaAppsScript(email, name, otp) {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      throw new Error("APPS_SCRIPT_URL is not configured in environment");
    }

    console.log(
      `📧 Sending OTP email → To: ${email}, Name: ${name}, OTP: ${otp}`,
    );
    console.log(`📧 Apps Script URL: ${appsScriptUrl}`);

    const response = await axios.post(
      appsScriptUrl,
      {
        email: String(email),
        name: String(name),
        otp: String(otp),
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 second timeout
      },
    );

    console.log(`📧 Apps Script response:`, JSON.stringify(response.data));

    if (response.data && response.data.status === "error") {
      throw new Error(response.data.message || "Apps Script returned an error");
    }

    return response.data;
  }

  // Find user by identifier
  async findUserByIdentifier(identifier, loginType) {
    let query = {};

    if (loginType === "M") {
      query.mobileNumber = identifier;
    } else if (loginType === "A") {
      query.aadharNumber = identifier;
    } else if (loginType === "C") {
      query.consumerId = identifier.toUpperCase();
    }

    return await User.findOne(query);
  }

  // Create new user
  async createUser(identifier, loginType, additionalData = {}) {
    const userData = {
      primaryLoginType: loginType,
    };

    // Prepare profile data
    const profileData = {
      ...additionalData,
    };

    if (loginType === "M") {
      userData.mobileNumber = identifier;
      profileData.mobileNumber = identifier;
    } else if (loginType === "A") {
      userData.aadharNumber = identifier;
      profileData.aadharNumber = identifier;
    } else if (loginType === "C") {
      userData.consumerId = identifier.toUpperCase();
      profileData.consumerId = identifier.toUpperCase();
    }

    // Create user in auth database
    const user = await User.create(userData);

    // Create profile in profile database
    try {
      await profileService.createProfile(user._id, profileData);
    } catch (profileError) {
      // If profile creation fails, delete the user and throw error
      await User.deleteOne({ _id: user._id });
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    return user;
  }

  // Generate access token
  generateAccessToken(user) {
    const payload = {
      id: user._id,
      mobileNumber: user.mobileNumber,
      aadharNumber: user.aadharNumber,
      consumerId: user.consumerId,
      role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || "1h",
    });
  }

  // Generate refresh token
  generateRefreshToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
    });
  }

  // Refresh access token (with refresh token rotation)
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("+refreshToken");

      if (!user || user.refreshToken !== refreshToken) {
        // Possible token theft — invalidate all tokens
        if (user) {
          user.refreshToken = null;
          await user.save();
          auditService.log("TOKEN_REFRESH_FAILED", {
            userId: user._id,
            success: false,
            details: { reason: "Refresh token mismatch — possible theft" },
          });
        }
        throw new Error("Invalid refresh token");
      }

      if (!user.isActive) {
        throw new Error("Account is inactive");
      }

      // Generate new access token AND new refresh token (rotation)
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Save new refresh token, invalidating the old one
      user.refreshToken = newRefreshToken;
      await user.save();

      auditService.log("TOKEN_REFRESH", { userId: user._id });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Refresh token expired. Please login again");
      }
      throw error;
    }
  }

  // Logout
  async logout(userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
      auditService.log("LOGOUT", { userId });
      return { message: "Logged out successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get profile from profile database
      const profile = await profileService.getProfileByUserId(userId);
      if (!profile) {
        throw new Error("Profile not found");
      }

      return {
        ...user.toAuthJSON(),
        profile: {
          fullName: profile.fullName,
          email: profile.email,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          alternatePhone: profile.alternatePhone,
          address: profile.address,
          occupation: profile.occupation,
          emergencyContact: profile.emergencyContact,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
