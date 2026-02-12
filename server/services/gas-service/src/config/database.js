const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/suvidha_gas";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Gas Service: MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Gas Service: MongoDB connection failed", error);
    process.exit(1);
  }
};

const dbDisconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log("Gas Service: MongoDB disconnected successfully");
  } catch (error) {
    console.error("Gas Service: MongoDB disconnection failed", error);
  }
};

module.exports = { dbConnect, dbDisconnect };
