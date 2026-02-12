const axios = require("axios");
const { ApiError } = require("../../../../shared/common/utils/ApiError");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Authentication token required");
    }

    // Verify token with auth service
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/api/v1/auth/verify-token`,
      { token },
    );

    if (!response.data.data.valid) {
      throw new ApiError(401, "Invalid token");
    }

    req.user = response.data.data.user;
    next();
  } catch (error) {
    next(new ApiError(401, "Authentication failed"));
  }
};

module.exports = { authenticate };
