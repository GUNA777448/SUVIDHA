import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const SessionManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Decode JWT to get expiry (without verification)
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  };

  const accessPayload = accessToken ? decodeToken(accessToken) : null;
  const refreshPayload = refreshToken ? decodeToken(refreshToken) : null;

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isExpired = (timestamp) => {
    if (!timestamp) return true;
    return Date.now() > timestamp * 1000;
  };

  const getTimeRemaining = (timestamp) => {
    if (!timestamp) return "N/A";
    const diff = timestamp * 1000 - Date.now();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const handleLogoutAll = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Session Management
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Current User */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Current User
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Consumer ID:</span>{" "}
              <span className="font-medium">{user?.consumerId || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500">Role:</span>{" "}
              <span className="font-medium capitalize">
                {user?.role || "user"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Mobile:</span>{" "}
              <span className="font-medium">{user?.mobileNumber || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500">Login Type:</span>{" "}
              <span className="font-medium">
                {user?.primaryLoginType === "M"
                  ? "Mobile"
                  : user?.primaryLoginType === "A"
                    ? "Aadhar"
                    : "Consumer ID"}
              </span>
            </div>
          </div>
        </div>

        {/* Access Token Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Access Token
          </h2>
          {accessPayload ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`font-medium ${
                    isExpired(accessPayload.exp)
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {isExpired(accessPayload.exp) ? "❌ Expired" : "✅ Active"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Issued At:</span>
                <span>{formatDate(accessPayload.iat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expires At:</span>
                <span>{formatDate(accessPayload.exp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time Remaining:</span>
                <span className="font-medium">
                  {getTimeRemaining(accessPayload.exp)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No access token found</p>
          )}
        </div>

        {/* Refresh Token Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Refresh Token
          </h2>
          {refreshPayload ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`font-medium ${
                    isExpired(refreshPayload.exp)
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {isExpired(refreshPayload.exp) ? "❌ Expired" : "✅ Active"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Issued At:</span>
                <span>{formatDate(refreshPayload.iat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expires At:</span>
                <span>{formatDate(refreshPayload.exp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time Remaining:</span>
                <span className="font-medium">
                  {getTimeRemaining(refreshPayload.exp)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No refresh token found</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Actions</h2>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              🚪 Logout & Revoke Session
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                This will log you out and invalidate your refresh token on the
                server. Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleLogoutAll}
                  disabled={loggingOut}
                  className={`flex-1 py-2 rounded-lg font-medium text-white ${
                    loggingOut
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loggingOut ? "Logging out..." : "Yes, Logout"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
