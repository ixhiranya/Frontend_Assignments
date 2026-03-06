const { sql } = require("../db");

exports.getForms = async (req,res)=>{

  try{

    const result = await sql.query(
      "SELECT * FROM application_forms"
    );

    res.json(result.recordset);

  }catch(err){
    console.log(err);
  }

};

exports.createForm = async (req,res)=>{

  try{

    const {formName,sections} = req.body;

    const formResult = await sql.query`
      INSERT INTO application_forms (form_name)
      OUTPUT INSERTED.form_id
      VALUES (${formName})
    `;

    const formId = formResult.recordset[0].form_id;

    for(const section of sections){

      for(const doc of section.documents){

        const docResult = await sql.query`
        INSERT INTO master_documents(doc_name,format,max_size)
        OUTPUT INSERTED.doc_id
        VALUES(${doc.name},${doc.format},${doc.size})
        `;

        const docId = docResult.recordset[0].doc_id;

        await sql.query`
        INSERT INTO form_document_config
        (form_id,section_name,doc_id,mandatory,enabled)
        VALUES(${formId},${section.sectionName},
               ${docId},${doc.mandatory},1)
        `;

      }

    }

    res.json({message:"Form created successfully"});

  }catch(err){
    console.log(err);
  }

};