const express = require('express');
const router  = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const {
  getForms, createForm, updateForm, deleteForm, getFormDetail,
  addSection, deleteSection, addDocumentConfig, deleteDocumentConfig
} = require('../controllers/formsController');

router.get('/',                              verifyToken,                    getForms);
router.post('/',                             verifyToken, checkRole('Admin'),createForm);
router.put('/:id',                           verifyToken, checkRole('Admin'),updateForm);
router.delete('/:id',                        verifyToken, checkRole('Admin'),deleteForm);
router.get('/:formId/detail',                verifyToken,                    getFormDetail);
router.post('/:formId/sections',             verifyToken, checkRole('Admin'),addSection);
router.delete('/:formId/sections/:sectionId',verifyToken, checkRole('Admin'),deleteSection);
router.post('/:formId/documents',            verifyToken, checkRole('Admin'),addDocumentConfig);
router.delete('/documents/config/:configId', verifyToken, checkRole('Admin'),deleteDocumentConfig);

module.exports = router;
