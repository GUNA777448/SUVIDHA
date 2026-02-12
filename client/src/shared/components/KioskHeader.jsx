import React from "react";
import { useNavigate } from "react-router-dom";

const KioskHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>
          🏛️ SUVIDHA
        </h1>
        <span style={styles.tagline}>Government Services Kiosk</span>
      </div>
      <button onClick={handleLogout} style={styles.logoutBtn}>
        🚪 Exit
      </button>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#1a365d",
    color: "white",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  logo: {
    fontSize: "24px",
    margin: 0,
    cursor: "pointer",
  },
  tagline: {
    fontSize: "14px",
    opacity: 0.8,
  },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default KioskHeader;
