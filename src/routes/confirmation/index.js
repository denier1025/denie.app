const router = require("express").Router();

router.use("/email", require("./email"));
// router.use("/phonenumber", require("./phonenumber"))
// router.use("/passport", require("./passport"))

module.exports = router;
