import dotenv from "dotenv";

// Load environment variables before importing other modules
dotenv.config({
  path: "./.env",
});

import app from "./app.js";
import connectDB from "./db/index.js";

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log("Server is running on port " + port);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
