import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import v1Router from "./routes/v1/index.js";
import { API_PREFIX } from "./config/index.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(cookieParser());

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

// Mount versioned API router
app.use(API_PREFIX, v1Router);

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
