const router = require("express").Router();

router.use("/confirmation", require("./email"));
// router.use("/phonenumber", require("./phonenumber"))
// router.use("/passport", require("./passport"))

module.exports = router;
