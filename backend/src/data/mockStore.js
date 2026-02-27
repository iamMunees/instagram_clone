import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../../../clone/db/db.json");

const raw = fs.readFileSync(dataPath, "utf-8");
const store = JSON.parse(raw);
const nowIso = () => new Date().toISOString();

export const getPosts = () => store.posts || [];
export const getStories = () => store.story || [];
export const getStoryById = (id) =>
  getStories().find((story) => Number(story.id) === Number(id)) || null;
export const getProfiles = () => store.profile || [];
export const getSuggestions = () => store.suggetion || [];
export const getCurrentProfile = () => getProfiles()[0] || null;

export const createPost = ({ caption, image }) => {
  const me = getCurrentProfile();
  if (!me) {
    throw new Error("No profile available");
  }

  const nextId = getPosts().reduce((maxId, post) => Math.max(maxId, Number(post.id)), 0) + 1;
  const post = {
    id: nextId,
    user: {
      id: me.id,
      username: me.username,
      profile_pic: me.profile_pic,
    },
    image,
    caption,
    likes: 0,
    likedBy: [],
    comments: [],
    shares: 0,
    timestamp: nowIso(),
  };

  store.posts.unshift(post);
  return post;
};

export const toggleLikeOnPost = (postId) => {
  const me = getCurrentProfile();
  const post = getPosts().find((item) => Number(item.id) === Number(postId));
  if (!post || !me) {
    return null;
  }

  if (!Array.isArray(post.likedBy)) {
    post.likedBy = [];
  }

  const alreadyLiked = post.likedBy.includes(me.username);
  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((username) => username !== me.username);
    post.likes = Math.max((post.likes || 0) - 1, 0);
  } else {
    post.likedBy.push(me.username);
    post.likes = (post.likes || 0) + 1;
  }

  return { ...post, liked: !alreadyLiked };
};

export const addCommentToPost = (postId, commentText) => {
  const me = getCurrentProfile();
  const post = getPosts().find((item) => Number(item.id) === Number(postId));
  if (!post || !me) {
    return null;
  }

  if (!Array.isArray(post.comments)) {
    post.comments = [];
  }

  const comment = { user: me.username, comment: commentText };
  post.comments.push(comment);
  return post;
};

export const searchUsers = (query) => {
  const q = (query || "").trim().toLowerCase();
  const merged = [...getProfiles(), ...getSuggestions()];
  const unique = Array.from(new Map(merged.map((item) => [item.username, item])).values());

  if (!q) {
    return unique;
  }

  return unique.filter((user) => user.username.toLowerCase().includes(q));
};

const conversations = new Map();

const seedConversations = () => {
  if (conversations.size > 0) {
    return;
  }

  getSuggestions().forEach((user, idx) => {
    conversations.set(String(user.id), [
      { id: `${user.id}-1`, from: "them", text: `Hi, this is ${user.username}.`, createdAt: nowIso() },
      {
        id: `${user.id}-2`,
        from: "me",
        text: idx % 2 === 0 ? "Great to connect." : "How is your day going?",
        createdAt: nowIso(),
      },
    ]);
  });
};

export const getMessageThreads = () => {
  seedConversations();
  return getSuggestions().map((user) => {
    const items = conversations.get(String(user.id)) || [];
    const lastMessage = items[items.length - 1];
    return {
      user,
      lastMessage: lastMessage?.text || "",
      updatedAt: lastMessage?.createdAt || nowIso(),
    };
  });
};

export const getMessagesForUser = (userId) => {
  seedConversations();
  return conversations.get(String(userId)) || [];
};

export const sendMessageToUser = (userId, text) => {
  seedConversations();
  const key = String(userId);
  const messages = conversations.get(key) || [];
  const newItem = {
    id: `${key}-${Date.now()}`,
    from: "me",
    text,
    createdAt: nowIso(),
  };
  messages.push(newItem);
  conversations.set(key, messages);
  return newItem;
};

export const getNotifications = () => {
  const items = [];
  getPosts().forEach((post) => {
    if (post.likes) {
      items.push({
        id: `like-${post.id}`,
        type: "like",
        message: `${post.user.username} has ${post.likes} likes`,
        thumb: post.image,
        createdAt: post.timestamp,
      });
    }
    (post.comments || []).forEach((comment, index) => {
      items.push({
        id: `comment-${post.id}-${index}`,
        type: "comment",
        message: `${comment.user} commented: "${comment.comment}"`,
        thumb: post.image,
        createdAt: post.timestamp,
      });
    });
  });

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);
};
