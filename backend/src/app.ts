import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import { config } from "./config/index.js";

const app = express();

app.use(cookieParser());

// Enable CORS for requests from frontend
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true, // allow cookies to be sent from frontend
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Log HTTP requests in development mode
app.use(morgan("dev"));

app.use("/api", router);

// Backend Status check
app.get("/api/status", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

export default app;
