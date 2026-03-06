const { sql } = require("../db");

exports.submitApplication = async (req, res) => {

  try {

    const { formId } = req.body;

    // create application record
    const result = await sql.query`
      INSERT INTO applications (form_id,status)
      OUTPUT INSERTED.application_id
      VALUES (${formId},'Submitted')
    `;

    const applicationId = result.recordset[0].application_id;

    // save uploaded files
    if (req.files) {

      for (const file of req.files) {

        await sql.query`
        INSERT INTO uploaded_documents
        (application_id,doc_name,file_path)
        VALUES(
          ${applicationId},
          ${file.originalname},
          ${file.path}
        )
        `;

      }

    }

    res.json({ message: "Application submitted successfully" });

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: "Upload failed" });

  }

};

exports.getApplicationDetails = async (req, res) => {

  try {

    const result = await sql.query(`
      SELECT 
        a.application_id,
        f.form_name,
        u.doc_name,
        u.file_path
      FROM applications a
      JOIN application_forms f
      ON a.form_id = f.form_id
      JOIN uploaded_documents u
      ON a.application_id = u.application_id
    `);

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
  }

};