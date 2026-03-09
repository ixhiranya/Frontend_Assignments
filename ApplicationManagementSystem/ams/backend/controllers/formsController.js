const { getPool, sql } = require('../db');

// GET /api/forms - All forms (admin gets all, client gets active only)
const getForms = async (req, res) => {
  try {
    const pool = await getPool();
    const isAdmin = req.user.role === 'Admin';

    const result = await pool.request()
      .query(`
        SELECT f.form_id, f.form_name, f.description, f.is_active, f.created_at,
               u.full_name AS created_by_name,
               (SELECT COUNT(*) FROM Applications a WHERE a.form_id = f.form_id) AS applicant_count
        FROM ApplicationForms f
        JOIN Users u ON f.created_by = u.user_id
        ${isAdmin ? '' : 'WHERE f.is_active = 1'}
        ORDER BY f.created_at DESC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch forms.' });
  }
};

// POST /api/forms - Create form (Admin only)
const createForm = async (req, res) => {
  try {
    const { form_name, description } = req.body;
    if (!form_name) return res.status(400).json({ success: false, message: 'Form name is required.' });

    const pool   = await getPool();
    const result = await pool.request()
      .input('form_name',   sql.NVarChar, form_name)
      .input('description', sql.NVarChar, description || null)
      .input('created_by',  sql.Int,      req.user.user_id)
      .query('INSERT INTO ApplicationForms (form_name, description, created_by) OUTPUT INSERTED.form_id VALUES (@form_name, @description, @created_by)');

    res.status(201).json({ success: true, message: 'Form created.', form_id: result.recordset[0].form_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create form.' });
  }
};

// PUT /api/forms/:id - Update form
const updateForm = async (req, res) => {
  try {
    const { id }  = req.params;
    const { form_name, description, is_active } = req.body;

    const pool = await getPool();
    await pool.request()
      .input('id',          sql.Int,      id)
      .input('form_name',   sql.NVarChar, form_name)
      .input('description', sql.NVarChar, description || null)
      .input('is_active',   sql.Bit,      is_active !== undefined ? is_active : 1)
      .query('UPDATE ApplicationForms SET form_name=@form_name, description=@description, is_active=@is_active WHERE form_id=@id');

    res.json({ success: true, message: 'Form updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update form.' });
  }
};

// DELETE /api/forms/:id
const deleteForm = async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM ApplicationForms WHERE form_id = @id');
    res.json({ success: true, message: 'Form deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete form.' });
  }
};

// GET /api/forms/:formId/detail - Full form structure with sections + docs
const getFormDetail = async (req, res) => {
  try {
    const { formId } = req.params;
    const pool = await getPool();

    const formRes = await pool.request()
      .input('form_id', sql.Int, formId)
      .query('SELECT * FROM ApplicationForms WHERE form_id = @form_id');

    if (formRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    const sectionsRes = await pool.request()
      .input('form_id', sql.Int, formId)
      .query('SELECT * FROM FormSections WHERE form_id = @form_id ORDER BY display_order');

    const docsRes = await pool.request()
      .input('form_id', sql.Int, formId)
      .query(`
        SELECT fc.config_id, fc.section_id, fc.document_id,
               fc.allowed_file_format, fc.max_file_size, fc.is_mandatory,
               md.document_name, md.description AS doc_description
        FROM FormDocumentConfig fc
        JOIN MasterDocuments md ON fc.document_id = md.document_id
        WHERE fc.form_id = @form_id
      `);

    const sections = sectionsRes.recordset.map(s => ({
      ...s,
      documents: docsRes.recordset.filter(d => d.section_id === s.section_id)
    }));

    res.json({ success: true, data: { ...formRes.recordset[0], sections } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch form detail.' });
  }
};

// POST /api/forms/:formId/sections - Add section
const addSection = async (req, res) => {
  try {
    const { formId } = req.params;
    const { section_name, display_order } = req.body;
    if (!section_name) return res.status(400).json({ success: false, message: 'Section name required.' });

    const pool   = await getPool();
    const result = await pool.request()
      .input('form_id',      sql.Int,      formId)
      .input('section_name', sql.NVarChar, section_name)
      .input('display_order',sql.Int,      display_order || 0)
      .query('INSERT INTO FormSections (form_id, section_name, display_order) OUTPUT INSERTED.section_id VALUES (@form_id, @section_name, @display_order)');

    res.status(201).json({ success: true, message: 'Section added.', section_id: result.recordset[0].section_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add section.' });
  }
};

// DELETE /api/forms/:formId/sections/:sectionId
const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const pool = await getPool();
    await pool.request()
      .input('section_id', sql.Int, sectionId)
      .query('DELETE FROM FormSections WHERE section_id = @section_id');
    res.json({ success: true, message: 'Section deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete section.' });
  }
};

// POST /api/forms/:formId/documents - Add document config to form
const addDocumentConfig = async (req, res) => {
  try {
    const { formId } = req.params;
    const { section_id, document_id, allowed_file_format, max_file_size, is_mandatory } = req.body;

    if (!section_id || !document_id) {
      return res.status(400).json({ success: false, message: 'section_id and document_id are required.' });
    }

    const pool   = await getPool();
    const result = await pool.request()
      .input('form_id',             sql.Int,      formId)
      .input('section_id',          sql.Int,      section_id)
      .input('document_id',         sql.Int,      document_id)
      .input('allowed_file_format', sql.NVarChar, allowed_file_format || 'pdf,jpg,jpeg,png')
      .input('max_file_size',       sql.Int,      max_file_size        || 5242880)
      .input('is_mandatory',        sql.Bit,      is_mandatory !== undefined ? is_mandatory : 1)
      .query(`INSERT INTO FormDocumentConfig
                (form_id, section_id, document_id, allowed_file_format, max_file_size, is_mandatory)
              OUTPUT INSERTED.config_id
              VALUES (@form_id, @section_id, @document_id, @allowed_file_format, @max_file_size, @is_mandatory)`);

    res.status(201).json({ success: true, message: 'Document config added.', config_id: result.recordset[0].config_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add document config.' });
  }
};

// DELETE /api/forms/documents/config/:configId
const deleteDocumentConfig = async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('config_id', sql.Int, req.params.configId)
      .query('DELETE FROM FormDocumentConfig WHERE config_id = @config_id');
    res.json({ success: true, message: 'Document config removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to remove config.' });
  }
};

module.exports = { getForms, createForm, updateForm, deleteForm, getFormDetail, addSection, deleteSection, addDocumentConfig, deleteDocumentConfig };
