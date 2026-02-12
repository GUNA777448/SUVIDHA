import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginType, setLoginType] = useState("M"); // M, A, C
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Enter identifier, 2: Enter OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const loginTypeLabels = {
    M: "Mobile Number",
    A: "Aadhar Number",
    C: "Consumer ID",
  };

  const getPlaceholder = () => {
    switch (loginType) {
      case "M":
        return "Enter 10-digit mobile number";
      case "A":
        return "Enter 12-digit Aadhar number";
      case "C":
        return "Enter Consumer ID";
      default:
        return "Enter identifier";
    }
  };

  const validateIdentifier = () => {
    if (!identifier.trim()) {
      setError("Please enter your " + loginTypeLabels[loginType].toLowerCase());
      return false;
    }

    if (loginType === "M" && !/^[0-9]{10}$/.test(identifier)) {
      setError("Mobile number must be exactly 10 digits");
      return false;
    }

    if (loginType === "A" && !/^[0-9]{12}$/.test(identifier)) {
      setError("Aadhar number must be exactly 12 digits");
      return false;
    }

    if (loginType === "C" && identifier.trim().length === 0) {
      setError("Consumer ID cannot be empty");
      return false;
    }

    return true;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateIdentifier()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/get-otp`, {
        identifier: identifier.trim(),
        loginType,
      });

      if (response.data.success) {
        setOtpSent(true);
        setStep(2);
        // Show OTP in development mode
        if (response.data.data.otp) {
          alert(`OTP: ${response.data.data.otp} (Development Mode)`);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/verify-otp`, {
        identifier: identifier.trim(),
        loginType,
        otp: otp.trim(),
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        login(user, accessToken, refreshToken);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp("");
    setError("");
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setIdentifier("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">SUVIDHA</h1>
          <p className="text-gray-600 mt-2">Citizen Services Platform</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

            {/* Login Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Login Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange("M")}
                  className={`p-3 border-2 rounded-lg font-medium transition-all ${
                    loginType === "M"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  📱 Mobile
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange("A")}
                  className={`p-3 border-2 rounded-lg font-medium transition-all ${
                    loginType === "A"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  🆔 Aadhar
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange("C")}
                  className={`p-3 border-2 rounded-lg font-medium transition-all ${
                    loginType === "C"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  🔖 Consumer
                </button>
              </div>
            </div>

            {/* Identifier Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginTypeLabels[loginType]}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Enter OTP
            </h2>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">
                OTP sent to {loginTypeLabels[loginType]}:
              </p>
              <p className="font-semibold text-blue-600">{identifier}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Development Mode: OTP is 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
