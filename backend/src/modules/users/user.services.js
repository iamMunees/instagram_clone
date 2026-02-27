import {
  getMessageThreads,
  getMessagesForUser,
  getNotifications,
  getProfiles,
  getStoryById,
  getStories,
  getSuggestions,
  searchUsers,
  sendMessageToUser,
} from "../../data/mockStore.js";

export const getProfileService = async () => getProfiles();
export const getSuggestionsService = async () => getSuggestions();
export const getStoriesService = async () => getStories();
export const getStoryByIdService = async (id) => getStoryById(id);
export const searchUsersService = async (query) => searchUsers(query);
export const getNotificationsService = async () => getNotifications();
export const getMessageThreadsService = async () => getMessageThreads();
export const getMessagesForUserService = async (userId) => getMessagesForUser(userId);
export const sendMessageToUserService = async (userId, text) =>
  sendMessageToUser(userId, text);
