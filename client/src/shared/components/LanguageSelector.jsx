import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "ta", name: "தமிழ்" },
  ];

  return (
    <div style={styles.container}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          style={{
            ...styles.button,
            backgroundColor:
              i18n.language === lang.code ? "#2563eb" : "#e5e7eb",
            color: i18n.language === lang.code ? "white" : "#374151",
          }}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
    backgroundColor: "#f0f4f8",
  },
  button: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default LanguageSelector;
