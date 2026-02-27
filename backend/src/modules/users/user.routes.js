import { Router } from "express";
import {
  getMessageThreads,
  getMessagesForUser,
  getNotifications,
  getProfile,
  getStoryById,
  getStories,
  getSuggestions,
  searchUsers,
  sendMessageToUser,
} from "./user.controller.js";

const router = Router();

router.get("/profile", getProfile);
router.get("/suggestions", getSuggestions);
router.get("/suggetion", getSuggestions);
router.get("/story", getStories);
router.get("/story/:id", getStoryById);
router.get("/search/users", searchUsers);
router.get("/notifications", getNotifications);
router.get("/messages", getMessageThreads);
router.get("/messages/:userId", getMessagesForUser);
router.post("/messages/:userId", sendMessageToUser);

export default router;
