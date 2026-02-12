const Joi = require("joi");

const requestOTPSchema = Joi.object({
  identifier: Joi.string().required().messages({
    "string.empty": "Identifier is required",
    "any.required": "Identifier is required",
  }),
  loginType: Joi.string().valid("M", "A", "C").required().messages({
    "any.only": "Login type must be M (Mobile), A (Aadhar), or C (Consumer ID)",
    "any.required": "Login type is required",
  }),
});

const verifyOTPSchema = Joi.object({
  identifier: Joi.string().required().messages({
    "string.empty": "Identifier is required",
    "any.required": "Identifier is required",
  }),
  loginType: Joi.string().valid("M", "A", "C").required().messages({
    "any.only": "Login type must be M (Mobile), A (Aadhar), or C (Consumer ID)",
    "any.required": "Login type is required",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "any.required": "OTP is required",
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token is required",
    "any.required": "Refresh token is required",
  }),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    next();
  };
};

module.exports = {
  validateRequestOTP: validate(requestOTPSchema),
  validateVerifyOTP: validate(verifyOTPSchema),
  validateRefreshToken: validate(refreshTokenSchema),
};
