import express from "express";
import { PostModel } from "../models/Post.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const posts = await PostModel.find({});
    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
});

// GET POST BY postId
router.get("/:postId", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching post", error: error.message });
  }
});

// POST A NEW POST
router.post("/", async (req, res) => {
  try {
    const post = await PostModel.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating post", error: error.message });
  }
});

// UPDATE POST BY postId
router.put("/:postId", async (req, res) => {
  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating post", error: error.message });
  }
});

// DELETE POST BY postId
router.delete("/:postId", async (req, res) => {
  try {
    const post = await PostModel.findByIdAndDelete(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
});

const postRoutes = router;

export { postRoutes };
export default postRoutes;
