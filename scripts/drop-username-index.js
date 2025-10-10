import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

async function run() {
  if (!uri) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection.db;
  const collectionName = process.env.USER_COLLECTION || "users";

  try {
    const indexes = await db
      .listCollections({ name: collectionName })
      .toArray();
    if (!indexes.length) {
      console.log(`Collection ${collectionName} not found`);
      process.exit(0);
    }

    const coll = db.collection(collectionName);
    const idxs = await coll.indexes();
    const usernameIndex = idxs.find((i) => i.key && i.key.username === 1);
    if (usernameIndex) {
      console.log("Dropping username index:", usernameIndex.name);
      await coll.dropIndex(usernameIndex.name);
      console.log("Dropped username index");
    } else {
      console.log("No username index found");
    }
  } catch (err) {
    console.error("Error while checking/dropping index:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
