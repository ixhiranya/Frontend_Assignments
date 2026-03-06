const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  submitApplication,
  getApplications
} = require("../controllers/applicationController");

router.get("/", getApplications);
router.get("/admin", getApplicationDetails);
/* upload multiple files */
router.post(
  "/submit",
  upload.array("documents"),
  submitApplication
);

module.exports = router;