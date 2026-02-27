import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import routes from "./routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api", routes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image must be smaller than 5MB" });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err?.message === "Only image files are allowed") {
    return res.status(400).json({ error: err.message });
  }

  return next(err);
});

export default app;
