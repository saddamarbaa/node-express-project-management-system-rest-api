import express from "express";
import cors from "cors";

import v1Router from "./routes/v1/index.js";
import { API_PREFIX } from "./config/index.js";

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

console.log("API Prefix:", API_PREFIX);
// Mount versioned API router
app.use(API_PREFIX, v1Router);

export default app;
