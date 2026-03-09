const { getPool, sql } = require('../db');

// GET /api/applications - Client sees their own; admin sees all
const getApplications = async (req, res) => {
  try {
    const pool    = await getPool();
    const isAdmin = req.user.role === 'Admin';

    const result = await pool.request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT a.application_id, a.form_id, a.user_id, a.status, a.submitted_at, a.created_at,
               f.form_name, u.full_name AS applicant_name, u.username,
               (SELECT COUNT(*) FROM UploadedDocuments ud WHERE ud.application_id = a.application_id) AS uploaded_docs
        FROM Applications a
        JOIN ApplicationForms f ON a.form_id = f.form_id
        JOIN Users u ON a.user_id = u.user_id
        ${isAdmin ? '' : 'WHERE a.user_id = @user_id'}
        ORDER BY a.created_at DESC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch applications.' });
  }
};

// POST /api/applications - Create or get application for a form
const createApplication = async (req, res) => {
  try {
    const { form_id } = req.body;
    if (!form_id) return res.status(400).json({ success: false, message: 'form_id is required.' });

    const pool = await getPool();

    // Check if application already exists
    const existing = await pool.request()
      .input('form_id', sql.Int, form_id)
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT * FROM Applications WHERE form_id = @form_id AND user_id = @user_id');

    if (existing.recordset.length > 0) {
      return res.json({ success: true, message: 'Application already exists.', data: existing.recordset[0] });
    }

    const result = await pool.request()
      .input('form_id', sql.Int, form_id)
      .input('user_id', sql.Int, req.user.user_id)
      .query(`INSERT INTO Applications (form_id, user_id, status)
              OUTPUT INSERTED.*
              VALUES (@form_id, @user_id, 'Not Applied')`);

    res.status(201).json({ success: true, message: 'Application created.', data: result.recordset[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create application.' });
  }
};

// GET /api/applications/:id - Get single application with documents
const getApplicationDetail = async (req, res) => {
  try {
    const { id }  = req.params;
    const pool    = await getPool();
    const isAdmin = req.user.role === 'Admin';

    const appRes = await pool.request()
      .input('application_id', sql.Int, id)
      .input('user_id',        sql.Int, req.user.user_id)
      .query(`
        SELECT a.*, f.form_name, u.full_name AS applicant_name, u.username
        FROM Applications a
        JOIN ApplicationForms f ON a.form_id = f.form_id
        JOIN Users u ON a.user_id = u.user_id
        WHERE a.application_id = @application_id
        ${isAdmin ? '' : 'AND a.user_id = @user_id'}
      `);

    if (appRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const app = appRes.recordset[0];

    const docsRes = await pool.request()
      .input('application_id', sql.Int, id)
      .query(`
        SELECT ud.upload_id, ud.document_id, ud.file_name, ud.file_path, ud.file_size, ud.uploaded_at,
               md.document_name
        FROM UploadedDocuments ud
        JOIN MasterDocuments md ON ud.document_id = md.document_id
        WHERE ud.application_id = @application_id
      `);

    res.json({ success: true, data: { ...app, uploaded_documents: docsRes.recordset } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch application.' });
  }
};

// POST /api/applications/:id/submit - Submit application
const submitApplication = async (req, res) => {
  try {
    const { id }  = req.params;
    const pool    = await getPool();

    // Verify ownership
    const app = await pool.request()
      .input('application_id', sql.Int, id)
      .input('user_id',        sql.Int, req.user.user_id)
      .query('SELECT * FROM Applications WHERE application_id = @application_id AND user_id = @user_id');

    if (app.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Check mandatory documents are uploaded
    const mandatory = await pool.request()
      .input('form_id',        sql.Int, app.recordset[0].form_id)
      .input('application_id', sql.Int, id)
      .query(`
        SELECT fc.document_id, md.document_name
        FROM FormDocumentConfig fc
        JOIN MasterDocuments md ON fc.document_id = md.document_id
        WHERE fc.form_id = @form_id AND fc.is_mandatory = 1
          AND fc.document_id NOT IN (
            SELECT document_id FROM UploadedDocuments WHERE application_id = @application_id
          )
      `);

    if (mandatory.recordset.length > 0) {
      const missing = mandatory.recordset.map(d => d.document_name).join(', ');
      return res.status(400).json({
        success: false,
        message: `Missing mandatory documents: ${missing}`
      });
    }

    await pool.request()
      .input('application_id', sql.Int, id)
      .query(`UPDATE Applications SET status = 'Submitted', submitted_at = GETDATE() WHERE application_id = @application_id`);

    res.json({ success: true, message: 'Application submitted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to submit application.' });
  }
};

module.exports = { getApplications, createApplication, getApplicationDetail, submitApplication };
