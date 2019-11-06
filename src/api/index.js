const router = require("express").Router();

// router.use(require("../middleware/auth"));
// router.use(require("../middleware/checkRole"));
// router.use(require("../middleware/checkStructure"));
// router.use(require("../middleware/validation"));

router.use("/api", [
  require("./routes/users"),
  require("./routes/auth"),
  require("./routes/todos"),
  require("./routes/posts"),
  require("./routes/confirmation/index")
]);

module.exports = router;
