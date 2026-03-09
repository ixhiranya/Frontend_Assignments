const express = require('express');
const router  = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');
const { uploadDocument, downloadDocument, getMasterDocuments, createMasterDocument } = require('../controllers/uploadController');

router.post('/',                       verifyToken,                     uploadMiddleware.single('file'), uploadDocument);
router.get('/download/:uploadId',      verifyToken,                     downloadDocument);
router.get('/master-documents',        verifyToken,                     getMasterDocuments);
router.post('/master-documents',       verifyToken, checkRole('Admin'), createMasterDocument);

module.exports = router;
