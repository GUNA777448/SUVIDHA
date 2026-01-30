import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "./shared/layouts/MainLayout";
import KioskLayout from "./shared/layouts/KioskLayout";

// Feature Pages
import Login from "./features/auth/pages/Login";
import Dashboard from "./features/auth/pages/Dashboard";

// Service Pages (placeholders for now)
import ElectricityHome from "./features/electricity/pages/Home";
import GasHome from "./features/gas/pages/Home";
import WaterHome from "./features/water/pages/Home";
import MunicipalHome from "./features/municipal/pages/Home";
import AdminDashboard from "./features/admin/pages/Dashboard";

// Protected Route Component
import ProtectedRoute from "./shared/components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Kiosk Routes - Protected */}
      <Route
        element={
          <ProtectedRoute>
            <KioskLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/electricity/*" element={<ElectricityHome />} />
        <Route path="/gas/*" element={<GasHome />} />
        <Route path="/water/*" element={<WaterHome />} />
        <Route path="/municipal/*" element={<MunicipalHome />} />
      </Route>

      {/* Admin Routes - Protected with Admin Role */}
      <Route
        element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
