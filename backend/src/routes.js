import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import postRoutes from "./modules/posts/post.routes.js";
import userRoutes from "./modules/users/user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/", postRoutes);
router.use("/", userRoutes);

export default router;
