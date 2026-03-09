// routes/applications.js
const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getApplications, createApplication, getApplicationDetail, submitApplication } = require('../controllers/applicationsController');

router.get('/',       verifyToken, getApplications);
router.post('/',      verifyToken, createApplication);
router.get('/:id',    verifyToken, getApplicationDetail);
router.post('/:id/submit', verifyToken, submitApplication);

module.exports = router;
