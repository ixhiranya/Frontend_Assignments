-- ================================================================
-- Application Management System - Database Setup Script
-- Run this script in SQL Server Management Studio (SSMS)
-- ================================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AppManagementSystem')
BEGIN
    CREATE DATABASE AppManagementSystem;
    PRINT 'Database AppManagementSystem created.';
END
GO

USE AppManagementSystem;
GO

-- ----------------------------------------------------------------
-- Drop existing tables in dependency order
-- ----------------------------------------------------------------
IF OBJECT_ID('dbo.UploadedDocuments',   'U') IS NOT NULL DROP TABLE dbo.UploadedDocuments;
IF OBJECT_ID('dbo.Applications',        'U') IS NOT NULL DROP TABLE dbo.Applications;
IF OBJECT_ID('dbo.FormDocumentConfig',  'U') IS NOT NULL DROP TABLE dbo.FormDocumentConfig;
IF OBJECT_ID('dbo.MasterDocuments',     'U') IS NOT NULL DROP TABLE dbo.MasterDocuments;
IF OBJECT_ID('dbo.FormSections',        'U') IS NOT NULL DROP TABLE dbo.FormSections;
IF OBJECT_ID('dbo.ApplicationForms',    'U') IS NOT NULL DROP TABLE dbo.ApplicationForms;
IF OBJECT_ID('dbo.Users',               'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ----------------------------------------------------------------
-- Users
-- ----------------------------------------------------------------
CREATE TABLE Users (
    user_id       INT IDENTITY(1,1) PRIMARY KEY,
    username      NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(500) NOT NULL,
    full_name     NVARCHAR(200),
    role          NVARCHAR(20)  NOT NULL CHECK (role IN ('Admin','Client')),
    created_at    DATETIME DEFAULT GETDATE()
);
GO

-- ----------------------------------------------------------------
-- ApplicationForms
-- ----------------------------------------------------------------
CREATE TABLE ApplicationForms (
    form_id     INT IDENTITY(1,1) PRIMARY KEY,
    form_name   NVARCHAR(200) NOT NULL,
    description NVARCHAR(500),
    created_by  INT NOT NULL,
    is_active   BIT DEFAULT 1,
    created_at  DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES Users(user_id)
);
GO

-- ----------------------------------------------------------------
-- FormSections
-- ----------------------------------------------------------------
CREATE TABLE FormSections (
    section_id    INT IDENTITY(1,1) PRIMARY KEY,
    form_id       INT NOT NULL,
    section_name  NVARCHAR(200) NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (form_id) REFERENCES ApplicationForms(form_id) ON DELETE CASCADE
);
GO

-- ----------------------------------------------------------------
-- MasterDocuments
-- ----------------------------------------------------------------
CREATE TABLE MasterDocuments (
    document_id   INT IDENTITY(1,1) PRIMARY KEY,
    document_name NVARCHAR(200) NOT NULL,
    description   NVARCHAR(500),
    created_at    DATETIME DEFAULT GETDATE()
);
GO

-- ----------------------------------------------------------------
-- FormDocumentConfig
-- ----------------------------------------------------------------
CREATE TABLE FormDocumentConfig (
    config_id           INT IDENTITY(1,1) PRIMARY KEY,
    form_id             INT NOT NULL,
    section_id          INT NOT NULL,
    document_id         INT NOT NULL,
    allowed_file_format NVARCHAR(100) DEFAULT 'pdf,jpg,jpeg,png',
    max_file_size       INT           DEFAULT 5242880,   -- 5 MB in bytes
    is_mandatory        BIT           DEFAULT 1,
    FOREIGN KEY (form_id)     REFERENCES ApplicationForms(form_id) ON DELETE CASCADE,
    FOREIGN KEY (section_id)  REFERENCES FormSections(section_id),
    FOREIGN KEY (document_id) REFERENCES MasterDocuments(document_id)
);
GO

-- ----------------------------------------------------------------
-- Applications
-- ----------------------------------------------------------------
CREATE TABLE Applications (
    application_id INT IDENTITY(1,1) PRIMARY KEY,
    form_id        INT NOT NULL,
    user_id        INT NOT NULL,
    status         NVARCHAR(20) DEFAULT 'Not Applied' CHECK (status IN ('Not Applied','Submitted')),
    submitted_at   DATETIME,
    created_at     DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (form_id)  REFERENCES ApplicationForms(form_id),
    FOREIGN KEY (user_id)  REFERENCES Users(user_id)
);
GO

-- ----------------------------------------------------------------
-- UploadedDocuments
-- ----------------------------------------------------------------
CREATE TABLE UploadedDocuments (
    upload_id      INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT NOT NULL,
    document_id    INT NOT NULL,
    file_name      NVARCHAR(300),
    file_path      NVARCHAR(500) NOT NULL,
    file_size      INT,
    uploaded_at    DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (application_id) REFERENCES Applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (document_id)    REFERENCES MasterDocuments(document_id)
);
GO

-- ================================================================
-- Seed Data
-- ================================================================

-- Seed Master Documents
INSERT INTO MasterDocuments (document_name, description) VALUES
    ('Passport Copy',           'Valid passport - bio data page'),
    ('National ID Card',        'Government issued national identity card'),
    ('Proof of Address',        'Utility bill or bank statement (last 3 months)'),
    ('Birth Certificate',       'Official birth certificate'),
    ('Academic Transcript',     'Official academic records from institution'),
    ('Degree Certificate',      'Highest educational degree certificate'),
    ('Experience Letter',       'Experience letter from previous employer'),
    ('Bank Statement',          'Last 6 months bank statement'),
    ('Tax Returns',             'Last 2 years tax returns'),
    ('Medical Certificate',     'Certificate from a registered medical practitioner'),
    ('Police Clearance',        'Police clearance certificate'),
    ('Reference Letter',        'Professional reference letter');
GO

PRINT 'Database setup complete!';
PRINT 'Run: node seed.js to create admin and sample client users.';
GO
