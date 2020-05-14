const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Post = require("../../models/Posts");
const Profile = require("../../models/Profile");
const User = require("../../models/user");

// @route   POST API/posts
// @desc    Tambah Postingan
// @access  Private
router.post(
  "/",
  [auth, [check("text", "Text is Required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);

    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route   GET API/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) =>{
    try {
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});
// @route   GET API/posts/:id
// @desc    Get post by ID
// @access  Private
router.get('/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg: "Post not Found"});
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.name == "CastError"){
            return res.status(404).json({msg: "Post not Found"});
        }
        res.status(500).send("server error");
    }
});
// @route   DELETE API/posts/:id
// @desc    Delete post by ID
// @access  Private
router.delete('/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg: "Post not Found"});
        }
        // Check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: "User not authorized"});
        }

        await post.remove();
        res.json({msg: "Post Removed"});
    } catch (err) {
        console.error(err.message);
        if(err.name == "CastError"){
            return res.status(404).json({msg: "Post not Found"});
        }
        res.status(500).send("server error");
    }
});

module.exports = router;