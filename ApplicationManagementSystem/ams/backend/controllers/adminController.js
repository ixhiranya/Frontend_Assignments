const { getPool, sql } = require('../db');

// GET /api/admin/applications - All submitted applications with full detail
const getAdminApplications = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT a.application_id, a.form_id, a.user_id, a.status, a.submitted_at, a.created_at,
             f.form_name, u.full_name AS applicant_name, u.username,
             (SELECT COUNT(*) FROM UploadedDocuments ud WHERE ud.application_id = a.application_id) AS doc_count
      FROM Applications a
      JOIN ApplicationForms f ON a.form_id = f.form_id
      JOIN Users u ON a.user_id = u.user_id
      ORDER BY a.submitted_at DESC, a.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch applications.' });
  }
};

// GET /api/admin/applications/:id - Full application detail with documents
const getAdminApplicationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const pool   = await getPool();

    const appRes = await pool.request()
      .input('application_id', sql.Int, id)
      .query(`
        SELECT a.*, f.form_name, u.full_name AS applicant_name, u.username
        FROM Applications a
        JOIN ApplicationForms f ON a.form_id = f.form_id
        JOIN Users u ON a.user_id = u.user_id
        WHERE a.application_id = @application_id
      `);

    if (appRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const docsRes = await pool.request()
      .input('application_id', sql.Int, id)
      .query(`
        SELECT ud.upload_id, ud.document_id, ud.file_name, ud.file_path,
               ud.file_size, ud.uploaded_at, md.document_name
        FROM UploadedDocuments ud
        JOIN MasterDocuments md ON ud.document_id = md.document_id
        WHERE ud.application_id = @application_id
      `);

    const sectionsRes = await pool.request()
      .input('form_id', sql.Int, appRes.recordset[0].form_id)
      .query(`
        SELECT fs.*, 
               (SELECT COUNT(*) FROM FormDocumentConfig fc WHERE fc.section_id = fs.section_id) AS required_docs
        FROM FormSections fs
        WHERE fs.form_id = @form_id
        ORDER BY fs.display_order
      `);

    res.json({
      success: true,
      data: {
        ...appRes.recordset[0],
        sections: sectionsRes.recordset,
        uploaded_documents: docsRes.recordset
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch application detail.' });
  }
};

// GET /api/admin/stats - Dashboard stats
const getAdminStats = async (req, res) => {
  try {
    const pool = await getPool();

    const [forms, apps, users, submitted] = await Promise.all([
      pool.request().query('SELECT COUNT(*) AS cnt FROM ApplicationForms WHERE is_active = 1'),
      pool.request().query('SELECT COUNT(*) AS cnt FROM Applications'),
      pool.request().query("SELECT COUNT(*) AS cnt FROM Users WHERE role = 'Client'"),
      pool.request().query("SELECT COUNT(*) AS cnt FROM Applications WHERE status = 'Submitted'"),
    ]);

    res.json({
      success: true,
      data: {
        total_forms:     forms.recordset[0].cnt,
        total_apps:      apps.recordset[0].cnt,
        total_clients:   users.recordset[0].cnt,
        submitted_apps:  submitted.recordset[0].cnt,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

module.exports = { getAdminApplications, getAdminApplicationDetail, getAdminStats };
