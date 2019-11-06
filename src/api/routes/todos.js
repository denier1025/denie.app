const router = require("express").Router();
const Todo = require("../../models/Todo");
const sendData = require("../../utils/sendData");
const sendAnError = require("../../utils/sendingEmails/error");
const dotize = require("../../utils/dotize");
const combineData = require("../../utils/combineData");

// @route   GET api/todos?findKey=done&findVal=[$eq|$gt|$gte|$in|$lt|$lte|$ne|$nin]:true
// @route   GET api/todos?sortBy=createdAt&orderBy=desc
// @route   GET api/todos?page=2
// @desc    Get all todos
// @access  Private
router.get("/todos", async (req, res) => {
  try {
    const limit = 5;
    let skip = 0;

    if (req.query.page) {
      skip = parseInt(req.query.page) * limit - limit;
    }

    const findSet = {};
    let findVal = "";

    if (req.query.findKey) {
      if (req.query.findVal) {
        findVal = {};

        const parts = req.query.findVal.split(":");

        if (parts[0] === "$in" || parts[0] === "$nin") {
          parts[1] = JSON.parse(parts[1]);
        }

        findVal[parts[0]] = parts[1];
      }

      findSet[req.query.findKey] = findVal;
    }

    const sort = {};

    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.orderBy
        ? req.query.orderBy === "asc"
          ? 1
          : -1
        : -1;
    }

    const todos = await Todo.find({
      owner: req.auth._id,
      ...findSet
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const data = sendData(todos, res.locals.roleRights.allowedToSend);
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   GET api/todos/:todoId
// @desc    Get a todo by id
// @access  Private
router.get("/todos/:todoId", async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.todoId,
      owner: req.auth._id
    }).lean();

    if (!todo) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "TODO_NOT_FOUND" });
    }

    const data = sendData(todo, res.locals.roleRights.allowedToSend);
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   POST api/todos
// @desc    Create a todo
// @access  Private
router.post("/todos", async (req, res) => {
  try {
    const todo = new Todo();
    todo.owner = req.auth._id;

    combineData(todo, dotize.backward(req.body));

    await todo.save();

    const data = sendData(todo.toObject(), res.locals.roleRights.allowedToSend);
    data ? res.status(201).send(data) : res.status(201).end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   PATCH api/todos/:todoId
// @desc    Update a todo by id
// @access  Private
router.patch("/todos/:todoId", async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.todoId,
      owner: req.auth._id
    });

    if (!todo) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "TODO_NOT_FOUND" });
    }

    combineData(todo, dotize.backward(req.body));

    await todo.save();

    const data = sendData(todo.toObject(), res.locals.roleRights.allowedToSend);
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   DELETE api/todos/:todoId
// @desc    Remove a todo by id
// @access  Private
router.delete("/todos/:todoId", async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.todoId,
      owner: req.auth._id
    });

    if (!todo) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "TODO_NOT_FOUND" });
    }

    await todo.deleteOne();

    const data = sendData(todo.toObject(), res.locals.roleRights.allowedToSend);
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
