import {
  createStory,
  deleteStoryById,
  getMessageThreads,
  getMessagesForUser,
  getNotifications,
  getProfiles,
  getStoryById,
  getStories,
  getSuggestions,
  searchUsers,
  sendMessageToUser,
  STORY_DURATION_LIMITS,
} from "../../data/mockStore.js";

export const getProfileService = async () => getProfiles();
export const getSuggestionsService = async () => getSuggestions();
export const getStoriesService = async () => getStories();
export const getStoryByIdService = async (id) => getStoryById(id);
export const createStoryService = async (payload) => createStory(payload);
export const deleteStoryService = async (id) => deleteStoryById(id);
export const getStoryDurationLimitsService = async () => STORY_DURATION_LIMITS;
export const searchUsersService = async (query) => searchUsers(query);
export const getNotificationsService = async () => getNotifications();
export const getMessageThreadsService = async () => getMessageThreads();
export const getMessagesForUserService = async (userId) => getMessagesForUser(userId);
export const sendMessageToUserService = async (userId, text) =>
  sendMessageToUser(userId, text);
