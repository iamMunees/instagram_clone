import { Router } from "express";
import {
  addComment,
  createPost,
  getFeed,
  getUserPost,
  likePost,
} from "./post.controller.js";

const router = Router();

router.get("/posts", getFeed);
router.post("/posts", createPost);
router.get("/posts/user/:userId", getUserPost);
router.post("/posts/:postId/like", likePost);
router.post("/posts/:postId/comments", addComment);

export default router;
