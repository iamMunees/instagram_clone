import {
  addCommentToPost,
  createPost,
  getPosts,
  toggleLikeOnPost,
} from "../../data/mockStore.js";

export const getFeedService = async () => {
  return getPosts();
};

export const getUserPostService = async (userId) => {
  return getPosts().filter((post) => Number(post.user?.id) === Number(userId));
};

export const createPostService = async ({ caption, image }) => {
  return createPost({ caption, image });
};

export const likePostService = async (postId) => {
  return toggleLikeOnPost(postId);
};

export const commentPostService = async (postId, comment) => {
  return addCommentToPost(postId, comment);
};
