const { MongoClient } = require("mongodb");

const DB_USER = process.env.DB_USER || "suvidhakiosk_db_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "cecUA3tgIgEIJZSh";
const DB_CLUSTER = process.env.DB_CLUSTER || "suvidha.3qyst7o.mongodb.net";
const PROFILE_DB_URI =
  process.env.PROFILE_DB_URI ||
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CLUSTER}/suvidha_profile?appName=SUVIDHA`;

async function run() {
  const client = await MongoClient.connect(PROFILE_DB_URI);
  const db = client.db("suvidha_profile");
  const r = await db
    .collection("profiles")
    .updateOne(
      { mobileNumber: "9800000001" },
      { $set: { email: "gurunadharao5718@gmail.com" } },
    );
  console.log("Updated:", r.modifiedCount);
  await client.close();
}

run();
