import dotenv from "dotenv";
import { verifyEmailTransport } from "../controllers/healthCheck.controller.js";

dotenv.config();

(async () => {
  try {
    await verifyEmailTransport();
    console.log("SMTP verification succeeded");
  } catch (err) {
    console.error("SMTP verification failed:", err.message || err);
    process.exit(1);
  }
})();
