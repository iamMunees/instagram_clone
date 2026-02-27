import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../../../clone/db/db.json");

const raw = fs.readFileSync(dataPath, "utf-8");
const store = JSON.parse(raw);
const nowIso = () => new Date().toISOString();

const STORY_TTL_HOURS = 24;
const STORY_TTL_MS = STORY_TTL_HOURS * 60 * 60 * 1000;
const STORY_DEFAULT_DURATION_SECONDS = 8;
const STORY_MIN_DURATION_SECONDS = 5;
const STORY_MAX_DURATION_SECONDS = 30;

const addMs = (isoDate, ms) => new Date(new Date(isoDate).getTime() + ms).toISOString();

const normalizeStory = (story) => {
  const createdAt = story.createdAt || story.timestamp || nowIso();
  const expiresAt = story.expiresAt || addMs(createdAt, STORY_TTL_MS);
  const durationSeconds = Number(story.durationSeconds) || STORY_DEFAULT_DURATION_SECONDS;

  return {
    ...story,
    createdAt,
    expiresAt,
    durationSeconds,
    song: story.song || "",
    filter: story.filter || "none",
  };
};

const isStoryActive = (story) => new Date(story.expiresAt).getTime() > Date.now();

const pruneExpiredStories = () => {
  const stories = (store.story || []).map(normalizeStory);
  store.story = stories.filter(isStoryActive);
  return store.story;
};

const getCurrentUsername = () => getCurrentProfile()?.username || "";

export const getPosts = () => store.posts || [];
export const getProfiles = () => store.profile || [];
export const getSuggestions = () => store.suggetion || [];
export const getCurrentProfile = () => getProfiles()[0] || null;

export const getStories = () => {
  const myUsername = getCurrentUsername();

  return pruneExpiredStories()
    .map((story) => {
      const normalized = normalizeStory(story);
      return {
        ...normalized,
        isOwner: normalized.user?.username === myUsername,
      };
    })
    .sort((a, b) => {
      if (a.isOwner !== b.isOwner) {
        return a.isOwner ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

export const getStoryById = (id) =>
  getStories().find((story) => Number(story.id) === Number(id)) || null;

export const createStory = ({ image, durationSeconds, song, filter }) => {
  const me = getCurrentProfile();
  if (!me) {
    throw new Error("No profile available");
  }

  const parsedDuration =
    durationSeconds === undefined || durationSeconds === null || durationSeconds === ""
      ? STORY_DEFAULT_DURATION_SECONDS
      : Number(durationSeconds);

  if (
    Number.isNaN(parsedDuration) ||
    parsedDuration < STORY_MIN_DURATION_SECONDS ||
    parsedDuration > STORY_MAX_DURATION_SECONDS
  ) {
    const err = new Error(
      `durationSeconds must be between ${STORY_MIN_DURATION_SECONDS} and ${STORY_MAX_DURATION_SECONDS}`
    );
    err.code = "INVALID_STORY_DURATION";
    throw err;
  }

  pruneExpiredStories();

  const nextId = (store.story || []).reduce(
    (maxId, item) => Math.max(maxId, Number(item.id) || 0),
    0
  ) + 1;

  const createdAt = nowIso();
  const story = {
    id: nextId,
    user: {
      id: me.id,
      username: me.username,
      profile_pic: me.profile_pic,
    },
    image,
    createdAt,
    expiresAt: addMs(createdAt, STORY_TTL_MS),
    durationSeconds: parsedDuration,
    song: song || "",
    filter: filter || "none",
  };

  if (!Array.isArray(store.story)) {
    store.story = [];
  }

  store.story.unshift(story);

  return {
    ...story,
    isOwner: true,
  };
};

export const deleteStoryById = (id) => {
  pruneExpiredStories();
  const myUsername = getCurrentUsername();

  const stories = store.story || [];
  const index = stories.findIndex((story) => Number(story.id) === Number(id));

  if (index === -1) {
    return { status: "not_found" };
  }

  if (stories[index]?.user?.username !== myUsername) {
    return { status: "forbidden" };
  }

  const [deletedStory] = stories.splice(index, 1);
  return { status: "deleted", story: normalizeStory(deletedStory) };
};

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

export const STORY_DURATION_LIMITS = {
  min: STORY_MIN_DURATION_SECONDS,
  max: STORY_MAX_DURATION_SECONDS,
  default: STORY_DEFAULT_DURATION_SECONDS,
};
