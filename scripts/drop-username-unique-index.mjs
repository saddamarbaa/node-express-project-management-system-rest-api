import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "./.env" });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Please set MONGO_URI in your .env before running this script");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collName = "users";
    const collection = db.collection(collName);

    const indexes = await collection.indexes();
    console.log("Current indexes on", collName, indexes);

    // Look for an index on the username field (could be named differently)
    const usernameIndex = indexes.find((idx) => {
      if (!idx.key) return false;
      // index key can be { username: 1 } or similar
      return (
        Object.keys(idx.key).length === 1 &&
        Object.keys(idx.key)[0] === "username"
      );
    });

    if (!usernameIndex) {
      console.log("No index on `username` found. Nothing to do.");
      await mongoose.disconnect();
      return;
    }

    if (!usernameIndex.unique) {
      console.log(
        "Found index on `username` but it is not unique:",
        usernameIndex.name,
      );
      await mongoose.disconnect();
      return;
    }

    console.log("Found UNIQUE index on `username`:", usernameIndex.name);
    console.log("Dropping index", usernameIndex.name, "...");
    await collection.dropIndex(usernameIndex.name);
    console.log("Dropped index", usernameIndex.name);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(2);
  }
}

run();
