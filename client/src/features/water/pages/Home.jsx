import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>💧 Water Services</h1>
        <p style={styles.subtitle}>Manage your water bills and connections</p>
        <div style={styles.buttons}>
          <button style={styles.button}>Pay Bill</button>
          <button style={styles.button}>New Connection</button>
          <button style={styles.button}>Meter Reading</button>
          <button style={styles.button}>Complaints</button>
        </div>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
  },
  box: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "400px",
  },
  title: {
    fontSize: "28px",
    color: "#3b82f6",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "30px",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  button: {
    padding: "14px",
    fontSize: "16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  backBtn: {
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Home;
