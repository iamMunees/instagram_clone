import * as userService from "./user.services.js";
import { uploadImageBuffer } from "../../config/cloudinary.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await userService.getProfileService();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const suggestions = await userService.getSuggestionsService();
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStories = async (req, res) => {
  try {
    const stories = await userService.getStoriesService();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const story = await userService.getStoryByIdService(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "image file is required" });
    }

    const uploaded = await uploadImageBuffer(req.file.buffer, "insta-clone/stories");

    const story = await userService.createStoryService({
      image: uploaded.secure_url,
      durationSeconds: req.body?.durationSeconds,
      song: req.body?.song?.trim(),
      filter: req.body?.filter?.trim(),
    });

    res.status(201).json(story);
  } catch (err) {
    if (err?.code === "INVALID_STORY_DURATION") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const result = await userService.deleteStoryService(req.params.id);

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Story not found" });
    }

    if (result.status === "forbidden") {
      return res.status(403).json({ error: "You can only delete your own story" });
    }

    return res.json({ success: true, story: result.story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStoryDurationLimits = async (req, res) => {
  try {
    const limits = await userService.getStoryDurationLimitsService();
    res.json(limits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const users = await userService.searchUsersService(req.query.q || "");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await userService.getNotificationsService();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessageThreads = async (req, res) => {
  try {
    const threads = await userService.getMessageThreadsService();
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessagesForUser = async (req, res) => {
  try {
    const messages = await userService.getMessagesForUserService(req.params.userId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendMessageToUser = async (req, res) => {
  try {
    const text = req.body?.text?.trim();
    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }
    const message = await userService.sendMessageToUserService(req.params.userId, text);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
