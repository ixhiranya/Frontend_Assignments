const path = require('path');
const fs   = require('fs');
const { getPool, sql } = require('../db');
const { uploadDir } = require('../middleware/upload');

// POST /api/upload - Upload document for an application
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { application_id, document_id } = req.body;
    if (!application_id || !document_id) {
      // Clean up orphaned file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'application_id and document_id are required.' });
    }

    const pool = await getPool();

    // Verify application belongs to user
    const appCheck = await pool.request()
      .input('application_id', sql.Int, application_id)
      .input('user_id',        sql.Int, req.user.user_id)
      .query('SELECT * FROM Applications WHERE application_id = @application_id AND user_id = @user_id');

    if (appCheck.recordset.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Application not found or access denied.' });
    }

    if (appCheck.recordset[0].status === 'Submitted') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Cannot upload to a submitted application.' });
    }

    // Validate file format against form config
    const config = await pool.request()
      .input('form_id',     sql.Int, appCheck.recordset[0].form_id)
      .input('document_id', sql.Int, document_id)
      .query('SELECT * FROM FormDocumentConfig WHERE form_id = @form_id AND document_id = @document_id');

    if (config.recordset.length > 0) {
      const allowed = config.recordset[0].allowed_file_format.split(',').map(e => e.trim().toLowerCase());
      const ext     = path.extname(req.file.originalname).toLowerCase().slice(1);
      if (!allowed.includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: `File type .${ext} not allowed. Allowed: ${allowed.join(', ')}` });
      }
      if (req.file.size > config.recordset[0].max_file_size) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: `File exceeds max size of ${config.recordset[0].max_file_size / 1024 / 1024}MB.` });
      }
    }

    // Remove existing upload for same document (replace)
    const existing = await pool.request()
      .input('application_id', sql.Int, application_id)
      .input('document_id',    sql.Int, document_id)
      .query('SELECT * FROM UploadedDocuments WHERE application_id = @application_id AND document_id = @document_id');

    if (existing.recordset.length > 0) {
      const oldPath = existing.recordset[0].file_path;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await pool.request()
        .input('application_id', sql.Int, application_id)
        .input('document_id',    sql.Int, document_id)
        .query('DELETE FROM UploadedDocuments WHERE application_id = @application_id AND document_id = @document_id');
    }

    // Save upload record
    const result = await pool.request()
      .input('application_id', sql.Int,      application_id)
      .input('document_id',    sql.Int,      document_id)
      .input('file_name',      sql.NVarChar, req.file.originalname)
      .input('file_path',      sql.NVarChar, req.file.path)
      .input('file_size',      sql.Int,      req.file.size)
      .query(`INSERT INTO UploadedDocuments (application_id, document_id, file_name, file_path, file_size)
              OUTPUT INSERTED.*
              VALUES (@application_id, @document_id, @file_name, @file_path, @file_size)`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: result.recordset[0]
    });
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Upload failed.' });
  }
};

// GET /api/documents/download/:uploadId - Download file
const downloadDocument = async (req, res) => {
  try {
    const pool   = await getPool();
    const isAdmin = req.user.role === 'Admin';

    const result = await pool.request()
      .input('upload_id', sql.Int, req.params.uploadId)
      .input('user_id',   sql.Int, req.user.user_id)
      .query(`
        SELECT ud.*, a.user_id AS app_owner
        FROM UploadedDocuments ud
        JOIN Applications a ON ud.application_id = a.application_id
        WHERE ud.upload_id = @upload_id
        ${isAdmin ? '' : 'AND a.user_id = @user_id'}
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    const file = result.recordset[0];
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ success: false, message: 'File missing from server.' });
    }

    res.download(file.file_path, file.file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Download failed.' });
  }
};

// GET /api/master-documents - List all master documents
const getMasterDocuments = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query('SELECT * FROM MasterDocuments ORDER BY document_name');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
  }
};

// POST /api/master-documents - Create master document (Admin)
const createMasterDocument = async (req, res) => {
  try {
    const { document_name, description } = req.body;
    if (!document_name) return res.status(400).json({ success: false, message: 'document_name is required.' });

    const pool   = await getPool();
    const result = await pool.request()
      .input('document_name', sql.NVarChar, document_name)
      .input('description',   sql.NVarChar, description || null)
      .query('INSERT INTO MasterDocuments (document_name, description) OUTPUT INSERTED.* VALUES (@document_name, @description)');

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create master document.' });
  }
};

module.exports = { uploadDocument, downloadDocument, getMasterDocuments, createMasterDocument };
