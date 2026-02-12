const mongoose = require("mongoose");

const AUTH_DB_URI =
  process.env.AUTH_DB_URI || "mongodb://localhost:27017/suvidha_auth";
const PROFILE_DB_URI =
  process.env.PROFILE_DB_URI || "mongodb://localhost:27017/suvidha_profile";

// Create connections immediately
const authConnection = mongoose.createConnection(AUTH_DB_URI);
const profileConnection = mongoose.createConnection(PROFILE_DB_URI);

authConnection.on("connected", () => {
  console.log("✅ Auth DB Connected Successfully");
  console.log(`📦 Auth Database: ${authConnection.name}`);
});

authConnection.on("error", (err) => {
  console.error("❌ Auth DB Connection Error:", err.message);
});

profileConnection.on("connected", () => {
  console.log("✅ Profile DB Connected Successfully");
  console.log(`📦 Profile Database: ${profileConnection.name}`);
});

profileConnection.on("error", (err) => {
  console.error("❌ Profile DB Connection Error:", err.message);
});

const dbConnect = async () => {
  try {
    console.log("📡 Database connections established");
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  if (authConnection) {
    await authConnection.close();
    console.log("🔌 Auth DB connection closed");
  }
  if (profileConnection) {
    await profileConnection.close();
    console.log("🔌 Profile DB connection closed");
  }
  process.exit(0);
});

module.exports = {
  dbConnect,
  authConnection,
  profileConnection,
};
