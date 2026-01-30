import React from "react";
import { Outlet } from "react-router-dom";
import KioskHeader from "../components/KioskHeader";
import LanguageSelector from "../components/LanguageSelector";

const KioskLayout = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
      }}
    >
      <KioskHeader />
      <LanguageSelector />
      <main style={{ flex: 1, overflow: "auto", padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default KioskLayout;
