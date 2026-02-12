import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    alternatePhone: "",
    occupation: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      district: "",
      state: "Tamil Nadu",
      pincode: "",
      country: "India",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/profile`);
      if (response.data.success && response.data.data) {
        const p = response.data.data;
        setForm({
          fullName: p.fullName || "",
          email: p.email || "",
          dateOfBirth: p.dateOfBirth
            ? new Date(p.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: p.gender || "",
          alternatePhone: p.alternatePhone || "",
          occupation: p.occupation || "",
          address: {
            line1: p.address?.line1 || "",
            line2: p.address?.line2 || "",
            city: p.address?.city || "",
            district: p.address?.district || "",
            state: p.address?.state || "Tamil Nadu",
            pincode: p.address?.pincode || "",
            country: p.address?.country || "India",
          },
          emergencyContact: {
            name: p.emergencyContact?.name || "",
            phone: p.emergencyContact?.phone || "",
            relationship: p.emergencyContact?.relationship || "",
          },
        });
      }
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await axios.put(`${API_URL}/api/v1/profile`, form);
      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* User Info Bar */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Consumer ID:</strong> {user?.consumerId || "N/A"}{" "}
            &nbsp;|&nbsp;
            <strong>Mobile:</strong> {user?.mobileNumber || "N/A"} &nbsp;|&nbsp;
            <strong>Role:</strong> {user?.role || "user"}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Alternate Phone</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={form.alternatePhone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Alternate phone number"
                />
              </div>
              <div>
                <label className={labelClass}>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter occupation"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Address Line 1</label>
                <input
                  type="text"
                  name="line1"
                  value={form.address.line1}
                  onChange={handleAddressChange}
                  className={inputClass}
                  placeholder="House/Flat No., Street"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address Line 2</label>
                <input
                  type="text"
                  name="line2"
                  value={form.address.line2}
                  onChange={handleAddressChange}
                  className={inputClass}
                  placeholder="Area, Landmark"
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  name="city"
                  value={form.address.city}
                  onChange={handleAddressChange}
                  className={inputClass}
                  placeholder="City"
                />
              </div>
              <div>
                <label className={labelClass}>District</label>
                <input
                  type="text"
                  name="district"
                  value={form.address.district}
                  onChange={handleAddressChange}
                  className={inputClass}
                  placeholder="District"
                />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  name="state"
                  value={form.address.state}
                  onChange={handleAddressChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.address.pincode}
                  onChange={handleAddressChange}
                  className={inputClass}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.emergencyContact.name}
                  onChange={handleEmergencyChange}
                  className={inputClass}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.emergencyContact.phone}
                  onChange={handleEmergencyChange}
                  className={inputClass}
                  placeholder="Contact phone"
                />
              </div>
              <div>
                <label className={labelClass}>Relationship</label>
                <input
                  type="text"
                  name="relationship"
                  value={form.emergencyContact.relationship}
                  onChange={handleEmergencyChange}
                  className={inputClass}
                  placeholder="e.g., Spouse, Parent"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-medium text-white ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
