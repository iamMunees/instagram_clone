import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

export default app;
