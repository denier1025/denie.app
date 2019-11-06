const router = require("express").Router();
const Post = require("../../models/Post");
const sendData = require("../../utils/sendData");
const sendAnError = require("../../utils/sendingEmails/error");
const dotize = require("../../utils/dotize");
const combineData = require("../../utils/combineData");

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().lean();

    const data = sendData(posts, res.locals.roleRights.allowedToSend);
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   GET api/posts/:postId
// @desc    Get a post by id
// @access  Public
router.get("/posts/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)

    if (!post) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "POST_NOT_FOUND" });
    }

    await post.populate("owner").execPopulate();

    const data = sendData(post.toObject(), res.locals.roleRights.allowedToSend);
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post("/posts", async (req, res) => {
  try {
    const post = new Post();
    post.owner = req.auth._id;

    combineData(post, dotize.backward(req.body));

    await post.save();

    const data = sendData(post.toObject(), res.locals.roleRights.allowedToSend);
    data ? res.status(200).send(data) : res.status(201).end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   PATCH api/posts/:postId
// @desc    Update a post by id
// @access  Private
router.patch("/posts/:postId", async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      owner: req.auth._id
    });

    if (!post) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "POST_NOT_FOUND" });
    }

    combineData(post, dotize.backward(req.body));

    await post.save();

    await post.populate("owner").execPopulate();

    const data = sendData(post.toObject(), res.locals.roleRights.allowedToSend);
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   DELETE api/posts/:postId
// @desc    Remove a post by id
// @access  Private
router.delete("/posts/:postId", async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      owner: req.auth._id
    });

    if (!post) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "POST_NOT_FOUND" });
    }

    await post.deleteOne();

    const data = sendData(post.toObject(), res.locals.roleRights.allowedToSend);
    data ? res.status(200).send(data) : res.status(204).end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

module.exports = router;
