const express = require("express");
const router = express.Router();

const {getForms,createForm} = require("../controllers/formController");
const {verifyToken} = require("../middleware/authMiddleware");

router.get("/",getForms);
router.post("/create",verifyToken,createForm);

module.exports = router;