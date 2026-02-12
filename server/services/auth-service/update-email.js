const { MongoClient } = require("mongodb");

async function run() {
  const client = await MongoClient.connect("mongodb://localhost:27017");
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
