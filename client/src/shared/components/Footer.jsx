import React from "react";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>© 2026 SUVIDHA - Government Services Kiosk | All Rights Reserved</p>
    </footer>
  );
};

const styles = {
  footer: {
    padding: "15px 30px",
    backgroundColor: "#1a365d",
    color: "white",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default Footer;
