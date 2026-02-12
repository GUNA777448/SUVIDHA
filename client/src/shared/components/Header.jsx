import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.logo}>🏛️ SUVIDHA</h1>
      <button onClick={handleLogout} style={styles.logoutBtn}>
        Logout
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
  logo: {
    fontSize: "24px",
    margin: 0,
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Header;
