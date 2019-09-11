const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const errMsgHandler = require("../utils/errMsgHandler");
const checkFieldsForAccess = require("../middleware/checkFieldsForAccess");
const transformReceivedDataAndSave = require("../middleware/transformReceivedDataAndSave");
const internalServerError = require("./sharedParts/internalServerError")

// @route   GET api/tasks?completed=true
// @route   GET api/tasks?limit=10&skip=0
// @route   GET api/tasks?sortBy=createdAt:desc
// @desc    Get all tasks
// @access  Private
router.get("/", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.json(req.user.tasks);
  } catch (err) {
    internalServerError(err)
  }
});

// @route   GET api/tasks/:id
// @desc    Get a task by id
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      const error = new Error();
      error.name = "NotFoundError";
      error.message = "task not found";
      throw error;
    }

    res.json(task);
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.status(404).json(err);
    } else {
      internalServerError(err)
    }
  }
});

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post(
  "/",
  auth,
  checkFieldsForAccess,
  transformReceivedDataAndSave,
  async (req, res) => {
    try {
      req.task = await req.task.save();

      res.status(201).json();
    } catch (err) {
      if (err.name === "ValidationError") {
        res
          .status(400)
          .json({ name: "ValidationError", message: errMsgHandler(err) });
      } else if (err.name === "AccessError") {
        res.status(403).json(err);
      } else {
        internalServerError(err)
      }
    }
  }
);

// @route   PATCH api/tasks/:id
// @desc    Update a task by id
// @access  Private
router.patch(
  "/:id",
  auth,
  checkFieldsForAccess,
  transformReceivedDataAndSave,
  async (req, res) => {
    try {
      req.task = await req.task.save();

      res.json(req.task);
    } catch (err) {
      if ((err.name === "NotFoundError")) {
        res.status(404).json(err);
      } else if (err.name === "ValidationError") {
        res
          .status(400)
          .json({ name: "ValidationError", message: errMsgHandler(err) });
      } else if (err.name === "AccessError") {
        res.status(403).json(err);
      } else {
        internalServerError(err)
      }
    }
  }
);

// @route   DELETE api/tasks/:id
// @desc    Remove a task by id
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      const error = new Error();
      error.name = "NotFoundError";
      error.message = "task not found";
      throw error;
    }

    res.status(204).json();
  } catch (err) {
    if ((err.name = "NotFoundError")) {
      res.status(404).json(err);
    } else {
      internalServerError(err)
    }
  }
});

module.exports = router;
