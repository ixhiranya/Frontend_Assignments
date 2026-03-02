CREATE DATABASE ApplicationSystem;
USE ApplicationSystem;

CREATE TABLE users (
   id INT IDENTITY PRIMARY KEY,
   username VARCHAR(100),
   password VARCHAR(100),
   role VARCHAR(20)
);

CREATE TABLE master_documents (
   doc_id INT IDENTITY PRIMARY KEY,
   doc_name VARCHAR(100),
   format VARCHAR(50),
   max_size INT
);

CREATE TABLE application_forms (
   form_id INT IDENTITY PRIMARY KEY,
   form_name VARCHAR(100)
);

CREATE TABLE form_document_config (
   config_id INT IDENTITY PRIMARY KEY,
   form_id INT,
   section_name VARCHAR(50),
   doc_id INT,
   mandatory BIT,
   enabled BIT
);

CREATE TABLE applications (
   application_id INT IDENTITY PRIMARY KEY,
   form_id INT,
   user_id INT,
   status VARCHAR(50)
);

INSERT INTO application_forms (form_name)
VALUES ('Scholarship Form'),
       ('Bank Locker Form'),
       ('College Admission');