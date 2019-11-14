const crypto = require("crypto");
const router = require("express").Router();
const EmailConfirmationToken = require("../../models/EmailConfirmationToken");
const sendAnError = require("../../utils/sendingEmails/error");
const sendAConfirmationLink = require("../../utils/sendingEmails/confirmationLink");
const sendData = require("../../utils/sendData");
const User = require("../../models/User");
const Avatar = require("../../models/Avatar");
const checkSubordination = require("../../utils/checkSubordination");
const dotize = require("../../utils/dotize");
const combineData = require("../../utils/combineData");

const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/checkRole");
const checkStructure = require("../../middlewares/checkStructure");
const validation = require("../../middlewares/validation");
const checkProfile = require("../../middlewares/checkProfile");

const {
  getUsersJoiSchema,
  getUserJoiSchema,
  postUserJoiSchema,
  patchUserDisplayNameJoiSchema,
  patchUserEmailAddressJoiSchema,
  patchUserPasswordJoiSchema,
  deleteUserJoiSchema,
  deleteUserDisplayNameJoiSchema
} = require("../../settings/joiSchemas/users");

const {
  getUsersController,
  getUserCurrentController,
  getUserController,
  postUserController,
  patchUserDisplayNameController,
  patchUserEmailAddressController,
  patchUserPasswordController,
  deleteUserController,
  deleteUserDisplayNameController
} = require("../../controllers/users");

router.get(
  "/users",
  [
    auth,
    checkRole(["admin", "administrator"]),
    checkStructure({
      query: [
        "page",
        "sortBy",
        "displayName",
        "email.address",
        "email.isConfirmed",
        "disabled",
        "role",
        "createdAt"
      ],
      body: []
    }),
    validation({
      schema: getUsersJoiSchema,
      validationPlaces: ["query"],
      uniqueFields: { params: [], query: [], body: [] },
      model: User
    })
  ],
  getUsersController([
    "_id",
    "displayName",
    "email.address",
    "email.isConfirmed",
    "disabled",
    "role",
    "createdAt"
  ])
);

router.get(
  "/users/current",
  [auth, checkRole(["user", "mod", "moderator", "admin", "administrator"])],
  getUserCurrentController([
    "_id",
    "displayName",
    "email.isConfirmed",
    "disabled",
    "role",
    "createdAt"
  ])
);

router.get(
  "/users/:userId",
  [
    auth,
    checkRole(["user", "mod", "moderator", "admin", "administrator"]),
    validation({
      schema: getUserJoiSchema,
      validationPlaces: ["params"],
      uniqueFields: { params: [], query: [], body: [] },
      model: User
    }),
    checkProfile({
      readable: true
    })
  ],
  getUserController(["_id", "displayName", "disabled", "role", "createdAt"])
);

router.post(
  "/users",
  [
    checkStructure({
      query: [],
      body: ["displayName", "email.address", "password"]
    }),
    validation({
      schema: postUserJoiSchema,
      validationPlaces: ["body"],
      uniqueFields: {
        params: [],
        query: [],
        body: ["displayName", "email.address"]
      },
      model: User
    })
  ],
  postUserController([])
);

router.patch(
  "/users/:userId/displayName",
  [
    auth,
    checkRole(["user", "mod", "moderator", "admin", "administrator"]),
    checkStructure({
      query: [],
      body: ["displayName"]
    }),
    validation({
      schema: patchUserDisplayNameJoiSchema,
      validationPlaces: ["params", "body"],
      uniqueFields: { params: [], query: [], body: ["displayName"] },
      model: User
    }),
    checkProfile({
      readable: false,
      selfMod: true,
      otherMod: false
    })
  ],
  patchUserDisplayNameController(["displayName"])
);

router.patch(
  "/users/:userId/emailAddress",
  [
    auth,
    checkRole(["user", "mod", "moderator", "admin", "administrator"]),
    checkStructure({
      query: [],
      body: ["email.address", "new"]
    }),
    validation({
      schema: patchUserEmailAddressJoiSchema,
      validationPlaces: ["params", "body"],
      uniqueFields: { params: [], query: [], body: ["new"] },
      model: User
    }),
    checkProfile({
      readable: false,
      selfMod: true,
      otherMod: false
    })
  ],
  patchUserEmailAddressController(["email.address"])
);

router.patch(
  "/users/:userId/password",
  [
    auth,
    checkRole(["user", "mod", "moderator", "admin", "administrator"]),
    checkStructure({
      query: [],
      body: ["password", "new"]
    }),
    validation({
      schema: patchUserPasswordJoiSchema,
      validationPlaces: ["params", "body"],
      uniqueFields: { params: [], query: [], body: [] },
      model: User
    }),
    checkProfile({
      readable: false,
      selfMod: true,
      otherMod: false
    })
  ],
  patchUserPasswordController([])
);

// "/users/:userId/disabled"
// "/users/:userId/role"

router.delete(
  "/users/:userId",
  [
    auth,
    checkRole(["administrator"]),
    validation({
      schema: deleteUserJoiSchema,
      validationPlaces: ["params"],
      uniqueFields: { params: ["userId"], query: [], body: [] },
      model: User
    }),
    checkProfile({
      readable: false,
      selfMod: false,
      otherMod: true
    })
  ],
  deleteUserController([])
);

router.delete(
  "/users/:userId/displayName",
  [
    auth,
    checkRole(["mod", "moderator", "admin", "administrator"]),
    validation({
      schema: deleteUserDisplayNameJoiSchema,
      validationPlaces: ["params"],
      uniqueFields: { params: [], query: [], body: [] },
      model: User
    }),
    checkProfile({
      readable: false,
      selfMod: false,
      otherMod: true
    })
  ],
  deleteUserDisplayNameController([])
);

// // @route   GET api/users/current
// // @desc    Fetch a current user
// // @access  Private
// router.get("/users/current", (req, res) => {
//   try {
//     const data = sendData(
//       req.auth.toObject(),
//       res.locals.roleRights.allowedToSend
//     );
//     data ? res.send(data) : res.end();
//   } catch (err) {
//     sendAnError(err);

//     res.status(500).send({
//       name: "InternalServerError",
//       code: "INTERNAL_SERVER_ERROR"
//     });
//   }
// });

// // @route   PATCH api/users/current
// // @desc    Update a current user's fields
// // @access  Private
// router.patch("/users/current", async (req, res) => {
//   try {
//     combineData(req.auth, dotize.backward(req.body));

//     await req.auth.save();

//     const data = sendData(
//       req.auth.toObject(),
//       res.locals.roleRights.allowedToSend
//     );
//     data ? res.send(data) : res.end();
//   } catch (err) {
//     sendAnError(err);

//     res.status(500).send({
//       name: "InternalServerError",
//       code: "INTERNAL_SERVER_ERROR"
//     });
//   }
// });

// // @route   GET api/users
// // @desc    Fetch all users
// // @access  Private
// router.get("/users", async (req, res) => {
//   try {
//     const profiles = await User.find().lean();

//     const data = sendData(profiles, res.locals.roleRights.allowedToSend);
//     data ? res.send(data) : res.end();
//   } catch (err) {
//     sendAnError(err);

//     res.status(500).send({
//       name: "InternalServerError",
//       code: "INTERNAL_SERVER_ERROR"
//     });
//   }
// });

// // @route   GET api/users/:userId
// // @desc    Fetch a user
// // @access  Private
// router.get("/users/:userId", async (req, res) => {
//   try {
//     const profile = await User.findById(req.params.userId).lean();

//     if (!profile) {
//       return res
//         .status(404)
//         .send({ name: "NotFoundError", code: "USER_NOT_FOUND" });
//     }

//     const data = sendData(profile, res.locals.roleRights.allowedToSend);
//     data ? res.send(data) : res.end();
//   } catch (err) {
//     sendAnError(err);

//     res.status(500).send({
//       name: "InternalServerError",
//       code: "INTERNAL_SERVER_ERROR"
//     });
//   }
// });

// // @route   PATCH api/users/:userId
// // @desc    Update a user
// // @access  Private
// router.patch("/users/:userId", async (req, res) => {
//   try {
//     const profile = await User.findById(req.params.userId);

//     if (!profile) {
//       return res
//         .status(404)
//         .send({ name: "NotFoundError", code: "USER_NOT_FOUND" });
//     }

//     checkSubordination(
//       req.auth,
//       profile,
//       res.locals.roleRights.subordination,
//       req.body.role
//     );

//     combineData(profile, dotize.backward(req.body));

//     await profile.save();

//     const data = sendData(
//       profile.toObject(),
//       res.locals.roleRights.allowedToSend
//     );
//     data ? res.send(data) : res.end();
//   } catch (err) {
//     if (err.name === "AccessError") {
//       res.status(403).send(err);
//     } else {
//       sendAnError(err);

//       res.status(500).send({
//         name: "InternalServerError",
//         code: "INTERNAL_SERVER_ERROR"
//       });
//     }
//   }
// });

// // @route   DELETE api/users/:userId
// // @desc    Delete a user
// // @access  Private
// router.delete("/users/:userId", async (req, res) => {
//   try {
//     const profile = await User.findById(req.params.userId);

//     if (!profile) {
//       return res
//         .status(404)
//         .send({ name: "NotFoundError", code: "USER_NOT_FOUND" });
//     }

//     checkSubordination(req.auth, profile, res.locals.roleRights.subordination);

//     await profile.deleteOne();

//     const data = sendData(
//       profile.toObject(),
//       res.locals.roleRights.allowedToSend
//     );
//     data ? res.status(200).send(data) : res.status(204).end();
//   } catch (err) {
//     if (err.name === "AccessError") {
//       res.status(403).send(err);
//     } else {
//       sendAnError(err);

//       res.status(500).send({
//         name: "InternalServerError",
//         code: "INTERNAL_SERVER_ERROR"
//       });
//     }
//   }
// });

// // @route   POST api/users
// // @desc    Register a user
// // @access  Public
// router.post("/users", async (req, res) => {
//   try {
//     const profile = new User();

//     combineData(profile, dotize.backward(req.body));

//     await profile.save();

//     // const emailConfirmationToken = await new EmailConfirmationToken({
//     //   owner: profile._id,
//     //   token: crypto.randomBytes(16).toString("hex")
//     // }).save();
//     // await sendAConfirmationLink(req, emailConfirmationToken);

//     const data = sendData(
//       profile.toObject(),
//       res.locals.roleRights.allowedToSend
//     );
//     data ? res.status(201).send(data) : res.status(201).end();
//   } catch (err) {
//     sendAnError(err);

//     res.status(500).send({
//       name: "InternalServerError",
//       code: "INTERNAL_SERVER_ERROR"
//     });
//   }
// });

// @route   POST api/users/current/avatar
// @desc    Upload a current avatar
// @access  Private
router.post("/users/current/avatar", async (req, res) => {
  try {
    let avatar = await Avatar.findOne({ owner: req.auth._id });

    if (!avatar) {
      avatar = new Avatar();
      avatar.owner = req.auth._id;
    }

    combineData(avatar, dotize.backward(req.body));

    await avatar.save();

    const data = sendData(
      avatar.toObject(),
      res.locals.roleRights.allowedToSend
    );
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   GET api/users/current/avatar
// @desc    Fetch a current avatar
// @access  Private
router.get("/users/current/avatar", async (req, res) => {
  try {
    let avatar = await Avatar.findOne({ owner: req.auth._id }).lean();

    if (!avatar) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "AVATAR_NOT_FOUND" });
    }

    const data = sendData(avatar, res.locals.roleRights.allowedToSend);
    data ? res.send(data) : res.end();
  } catch (err) {
    sendAnError(err);

    res.status(500).send({
      name: "InternalServerError",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// @route   DELETE api/users/current/avatar
// @desc    Remove a current avatar
// @access  Private
router.delete("/users/current/avatar", async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ owner: req.auth._id });

    if (!avatar) {
      return res
        .status(404)
        .send({ name: "NotFoundError", code: "AVATAR_NOT_FOUND" });
    }

    await avatar.deleteOne();

    const data = sendData(
      avatar.toObject(),
      res.locals.roleRights.allowedToSend
    );
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
