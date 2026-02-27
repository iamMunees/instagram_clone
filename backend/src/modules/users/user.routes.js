import { Router } from "express";
import {
  createStory,
  deleteStory,
  getMessageThreads,
  getMessagesForUser,
  getNotifications,
  getProfile,
  getStoryById,
  getStoryDurationLimits,
  getStories,
  getSuggestions,
  searchUsers,
  sendMessageToUser,
} from "./user.controller.js";
import { uploadStoryImage } from "./user.upload.js";

const router = Router();

router.get("/profile", getProfile);
router.get("/suggestions", getSuggestions);
router.get("/suggetion", getSuggestions);
router.get("/story", getStories);
router.post("/story", uploadStoryImage.single("image"), createStory);
router.get("/story/limits", getStoryDurationLimits);
router.get("/story/:id", getStoryById);
router.delete("/story/:id", deleteStory);
router.get("/search/users", searchUsers);
router.get("/notifications", getNotifications);
router.get("/messages", getMessageThreads);
router.get("/messages/:userId", getMessagesForUser);
router.post("/messages/:userId", sendMessageToUser);

export default router;
