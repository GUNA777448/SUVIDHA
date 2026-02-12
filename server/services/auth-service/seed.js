const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const AUTH_DB_URI =
  process.env.AUTH_DB_URI || "mongodb://localhost:27017/suvidha_auth";
const PROFILE_DB_URI =
  process.env.PROFILE_DB_URI || "mongodb://localhost:27017/suvidha_profile";

// Tamil Nadu inspired names
const firstNames = [
  "Arun",
  "Bharathi",
  "Chandran",
  "Deepa",
  "Ezhil",
  "Fathima",
  "Ganesh",
  "Hema",
  "Iyappan",
  "Janani",
  "Karthik",
  "Lakshmi",
  "Murugan",
  "Nithya",
  "Oviya",
  "Priya",
  "Rajan",
  "Saranya",
  "Thiru",
  "Uma",
  "Velu",
  "Yamuna",
  "Senthil",
  "Kavitha",
  "Bala",
  "Divya",
  "Gokul",
  "Harini",
  "Ilango",
  "Jaya",
  "Kumar",
  "Mala",
  "Naveen",
  "Padma",
  "Ramesh",
  "Siva",
  "Tamilselvi",
  "Usha",
  "Vijay",
  "Anitha",
  "Deva",
  "Geetha",
  "Hari",
  "Indira",
  "Kamal",
  "Mani",
  "Naga",
  "Pandi",
  "Rajesh",
  "Suganya",
];

const lastNames = [
  "Krishnan",
  "Subramanian",
  "Natarajan",
  "Pillai",
  "Murugesan",
  "Selvam",
  "Raman",
  "Sundaram",
  "Venkatesh",
  "Palani",
  "Durai",
  "Pandian",
  "Shanmugam",
  "Govindan",
  "Arumugam",
  "Manickam",
  "Chelladurai",
  "Muthusamy",
  "Ramasamy",
  "Velan",
];

const cities = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Erode",
  "Vellore",
  "Thanjavur",
  "Dindigul",
];

const states = ["Tamil Nadu"];

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function generateUsers(count) {
  const users = [];
  const profiles = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const city = cities[i % cities.length];

    // Generate unique identifiers for each user
    const mobileNumber = `9${String(800000001 + i).padStart(9, "0")}`;
    const aadharNumber = `${String(200000000001 + i).padStart(12, "0")}`;
    const consumerId = `CONS${String(10001 + i).padStart(6, "0")}`;

    const user = {
      mobileNumber,
      aadharNumber,
      consumerId,
      primaryLoginType: ["M", "A", "C"][i % 3],
      role: i === 0 ? "admin" : i < 5 ? "operator" : "user",
      isActive: true,
      lastLogin: randomDate(new Date("2025-01-01"), new Date("2026-02-09")),
    };

    const profile = {
      consumerId,
      mobileNumber,
      aadharNumber,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@gmail.com`,
      dateOfBirth: randomDate(new Date("1950-01-01"), new Date("2000-12-31")),
      gender: i % 2 === 0 ? "Male" : "Female",
      alternatePhone:
        i % 3 === 0 ? `91${String(9500000001 + i).padStart(9, "0")}` : null,
      address: {
        line1: `${i + 1}/123, ${lastName} Street`,
        line2: `${firstName} Nagar`,
        city: city,
        district: city,
        state: "Tamil Nadu",
        pincode: `6${String(20001 + i).padStart(5, "0")}`,
        country: "India",
      },
      occupation:
        i % 4 === 0
          ? "Business"
          : i % 4 === 1
            ? "Service"
            : i % 4 === 2
              ? "Self-Employed"
              : "Student",
      emergencyContact: {
        name: `${firstNames[(i + 10) % firstNames.length]} ${lastNames[(i + 5) % lastNames.length]}`,
        phone: `91${String(9700000001 + i).padStart(9, "0")}`,
        relation: i % 3 === 0 ? "Spouse" : i % 3 === 1 ? "Parent" : "Sibling",
      },
    };

    users.push(user);
    profiles.push(profile);
  }

  return { users, profiles };
}

async function seed() {
  let authConn = null;
  let profileConn = null;

  try {
    // Connect to Auth Database
    authConn = await mongoose.createConnection(AUTH_DB_URI);
    console.log("✅ Connected to Auth Database");

    // Connect to Profile Database
    profileConn = await mongoose.createConnection(PROFILE_DB_URI);
    console.log("✅ Connected to Profile Database");

    // Define User model for auth database
    const UserSchema = new mongoose.Schema({
      mobileNumber: String,
      aadharNumber: String,
      consumerId: String,
      primaryLoginType: String,
      role: String,
      isActive: Boolean,
      refreshToken: String,
      lastLogin: Date,
    });
    const User = authConn.model("User", UserSchema);

    // Define Profile model for profile database
    const ProfileSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      consumerId: String,
      mobileNumber: String,
      aadharNumber: String,
      fullName: String,
      email: String,
      dateOfBirth: Date,
      gender: String,
      alternatePhone: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        district: String,
        state: String,
        pincode: String,
        country: String,
      },
      occupation: String,
      emergencyContact: {
        name: String,
        phone: String,
        relation: String,
      },
    });
    const Profile = profileConn.model("Profile", ProfileSchema);

    // Clear existing data
    const deletedUsers = await User.deleteMany({});
    console.log(
      `🗑️  Cleared ${deletedUsers.deletedCount} existing users from auth DB`,
    );

    const deletedProfiles = await Profile.deleteMany({});
    console.log(
      `🗑️  Cleared ${deletedProfiles.deletedCount} existing profiles from profile DB`,
    );

    // Generate and insert data
    const { users, profiles } = generateUsers(100);
    const insertedUsers = await User.insertMany(users);
    console.log(`✅ Inserted ${insertedUsers.length} users into auth DB\n`);

    // Link profiles to users and insert
    const linkedProfiles = profiles.map((profile, index) => ({
      ...profile,
      userId: insertedUsers[index]._id,
    }));

    const insertedProfiles = await Profile.insertMany(linkedProfiles);
    console.log(
      `✅ Inserted ${insertedProfiles.length} profiles into profile DB\n`,
    );

    // Print sample credentials
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  📋 SAMPLE CREDENTIALS (OTP for all: 123456)");
    console.log(
      "═══════════════════════════════════════════════════════════\n",
    );

    // Show first 5 users
    for (let i = 0; i < 5; i++) {
      const u = insertedUsers[i];
      const p = insertedProfiles[i];
      console.log(`  👤 ${p.fullName} (${u.role})`);
      console.log(`     📱 Mobile (M):      ${u.mobileNumber}`);
      console.log(`     🆔 Aadhar (A):      ${u.aadharNumber}`);
      console.log(`     🔖 Consumer ID (C): ${u.consumerId}`);
      console.log(`     📧 Email:           ${p.email}`);
      console.log(`     🏙️  City:            ${p.address.city}`);
      console.log(
        `     📅 Last Login:      ${u.lastLogin.toISOString().split("T")[0]}`,
      );
      console.log("");
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  Total citizens seeded: ${insertedUsers.length}`);
    console.log(`  Auth DB: ${insertedUsers.length} users`);
    console.log(`  Profile DB: ${insertedProfiles.length} profiles`);
    console.log("  OTP for login: 123456");
    console.log(
      "═══════════════════════════════════════════════════════════\n",
    );

    await authConn.close();
    await profileConn.close();
    console.log("🔌 Database connections closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    if (authConn) await authConn.close();
    if (profileConn) await profileConn.close();
    process.exit(1);
  }
}

seed();
