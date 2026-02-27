import * as postService from "./post.services.js";

export const getFeed = async (req, res) => {
  try {
    const posts = await postService.getFeedService();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const posts = await postService.getUserPostService(req.params.userId);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { caption, image } = req.body;
    if (!caption || !image) {
      return res.status(400).json({ error: "caption and image are required" });
    }

    const post = await postService.createPostService({ caption, image });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await postService.likePostService(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment?.trim()) {
      return res.status(400).json({ error: "comment is required" });
    }

    const post = await postService.commentPostService(req.params.postId, comment.trim());
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
