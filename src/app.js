import express from "express";
import cors from "cors";

import healthCheckRouter from "./routes/healthCheck.route.js";

const app = express();

app.use(
  express.json({
    limit: "16kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "access-control-allow-origin",
      "Authorization",
      "Access-Control-Allow-Headers",
      "X-Requested-With",
    ],
  }),
);

app.use("/health", healthCheckRouter);

export default app;
