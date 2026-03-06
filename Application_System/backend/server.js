const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Logger middleware (move to top)
app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

const { connectDB, sql } = require("./db");

connectDB();

const authRoutes = require("./routes/authRoutes");
const formRoutes = require("./routes/formRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/applications", applicationRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("Server running...!!");
});

app.get("/forms", async (req, res) => {
  try {
    const result = await sql.query("SELECT * FROM application_forms");
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
  }
});

app.get("/applications", async (req, res) => {
  try {

    const result = await sql.query(`
      SELECT f.form_id,
             f.form_name,
             ISNULL(a.status,'Not Applied') as status
      FROM application_forms f
      LEFT JOIN applications a
      ON f.form_id = a.form_id
    `);

    res.json(result.recordset);

  } catch (err) {
    console.log(err);
  }
});

app.post("/create-form", async (req, res) => {
  try {
    const { formName, sections } = req.body;

    console.log("Received:", req.body);

    // 1️⃣ Insert Form
    const formResult = await sql.query`
      INSERT INTO application_forms (form_name)
      OUTPUT INSERTED.form_id
      VALUES (${formName})
    `;

    const formId = formResult.recordset[0].form_id;

    // 2️⃣ Insert Documents + Config
    for (const section of sections) {
      for (const doc of section.documents) {

        // Insert into master_documents
        const docResult = await sql.query`
          INSERT INTO master_documents (doc_name, format, max_size)
          OUTPUT INSERTED.doc_id
          VALUES (${doc.name}, ${doc.format}, ${doc.size})
        `;

        const docId = docResult.recordset[0].doc_id;

        // Insert into config table
        await sql.query`
          INSERT INTO form_document_config
          (form_id, section_name, doc_id, mandatory, enabled)
          VALUES (${formId}, ${section.sectionName},
                  ${docId}, ${doc.mandatory}, 1)
        `;
      }
    }

    res.json({ message: "Form Created & Saved to DB 🔥" });

  } catch (err) {
    console.log("DB ERROR:", err);
    res.status(500).json({ message: "Database Error" });
  }
});

app.get("/file-types", async (req, res) => {
  try {
    const result = await sql.query("SELECT * FROM file_types");
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching file types" });
  }
});

app.get("/form/:id", async (req, res) => {
  try {
    const formId = req.params.id;

    const formResult = await sql.query`
      SELECT * FROM application_forms WHERE form_id = ${formId}
    `;

    const configResult = await sql.query`
      SELECT c.section_name,
             d.doc_id,
             d.doc_name,
             d.format,
             d.max_size,
             c.mandatory
      FROM form_document_config c
      JOIN master_documents d
        ON c.doc_id = d.doc_id
      WHERE c.form_id = ${formId}
    `;

    res.json({
      form: formResult.recordset[0],
      documents: configResult.recordset
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching form" });
  }
});

app.post("/submit-application", async (req, res) => {
  try {

    const { formId } = req.body;

    // check if already submitted
    const existing = await sql.query`
      SELECT * FROM applications WHERE form_id = ${formId}
    `;

    if (existing.recordset.length > 0) {
      return res.json({ message: "Application already submitted" });
    }

    await sql.query`
      INSERT INTO applications (form_id, status)
      VALUES (${formId}, 'Submitted')
    `;

    res.json({ message: "Application submitted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error submitting application" });
  }
});

// Always keep listen at bottom
app.listen(5000, () => {
  console.log("Server started on port 5000");
});

