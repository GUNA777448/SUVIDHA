import React from "react";
import { useAuth } from "../AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">
                Welcome to SUVIDHA
              </h1>
              <p className="text-gray-600 mt-2">Citizen Services Dashboard</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-semibold">{user?.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-gray-600">Role:</p>
              <p className="font-semibold capitalize">{user?.role}</p>
            </div>
            {user?.mobileNumber && (
              <div>
                <p className="text-gray-600">Mobile:</p>
                <p className="font-semibold">{user.mobileNumber}</p>
              </div>
            )}
            {user?.aadharNumber && (
              <div>
                <p className="text-gray-600">Aadhar:</p>
                <p className="font-semibold">{user.aadharNumber}</p>
              </div>
            )}
            {user?.consumerId && (
              <div>
                <p className="text-gray-600">Consumer ID:</p>
                <p className="font-semibold">{user.consumerId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">⚡ Electricity</h3>
            <p className="text-gray-600">Pay bills and view history</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">💧 Water</h3>
            <p className="text-gray-600">Water bill payments</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">🔥 Gas</h3>
            <p className="text-gray-600">Gas connection services</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
