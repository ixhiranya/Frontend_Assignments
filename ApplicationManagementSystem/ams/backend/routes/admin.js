const express = require('express');
const router  = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { getAdminApplications, getAdminApplicationDetail, getAdminStats } = require('../controllers/adminController');

router.get('/stats',            verifyToken, checkRole('Admin'), getAdminStats);
router.get('/applications',     verifyToken, checkRole('Admin'), getAdminApplications);
router.get('/applications/:id', verifyToken, checkRole('Admin'), getAdminApplicationDetail);

module.exports = router;
