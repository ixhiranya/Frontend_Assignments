# Application Management System with Dynamic Form Builder

Full-stack application built with Node.js, Express.js, SQL Server, JWT, Tailwind CSS, and Multer.

---

## 🚀 Quick Setup

### Prerequisites
- Node.js v16+
- SQL Server (Express or full)
- npm

---

## 📦 Installation

### Step 1: Create Database
Run `sql/database.sql` in **SQL Server Management Studio**:
```
File → Open → sql/database.sql → Execute (F5)
```
This creates the `AppManagementSystem` DB with all tables and 12 seed documents.

### Step 2: Configure Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
DB_USER=sa
DB_PASSWORD=YourSQLPassword
DB_SERVER=localhost
DB_NAME=AppManagementSystem
JWT_SECRET=change_this_to_something_secret
```

### Step 3: Install & Seed
```bash
cd backend
npm install

### Step 4: Start Server
```bash
npm start
# or for dev:
npm run dev
```

Open: **http://localhost:5000/login.html**

---

## 🏗️ Architecture

### Backend
```
backend/
├── controllers/
│   ├── authController.js         # JWT login
│   ├── formsController.js        # Form CRUD + sections + doc config
│   ├── applicationsController.js # Application lifecycle
│   ├── uploadController.js       # Multer file upload + download
│   └── adminController.js        # Admin review endpoints
├── middleware/
│   ├── auth.js                   # verifyToken + checkRole
│   └── upload.js                 # Multer disk storage config
├── routes/
│   ├── auth.js
│   ├── forms.js
│   ├── applications.js
│   ├── upload.js
│   └── admin.js
├── uploads/                      # Uploaded files stored here
├── db.js                         # SQL Server connection pool
├── server.js                     # Express entry point
└── seed.js                       # Default users
```

### Frontend
```
frontend/
├── login.html                    # Login page
├── admin.html                    # Admin dashboard
├── formBuilder.html              # Dynamic form builder
├── client.html                   # Client dashboard
├── apply-form.html               # Dynamic application form
└── js/
    ├── api.js                    # HTTP client + toast + auth helpers
    ├── admin.js                  # Admin dashboard logic
    ├── formBuilder.js            # Form builder logic
    ├── client.js                 # Client dashboard logic
    └── applyForm.js              # File upload + submission logic
```

---

## 🌐 API Reference

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | Public | Login → JWT |
| GET | /api/forms | All | List forms |
| POST | /api/forms | Admin | Create form |
| PUT | /api/forms/:id | Admin | Update form |
| DELETE | /api/forms/:id | Admin | Delete form |
| GET | /api/forms/:id/detail | All | Form + sections + docs |
| POST | /api/forms/:id/sections | Admin | Add section |
| POST | /api/forms/:id/documents | Admin | Add doc config |
| GET | /api/applications | All | List applications |
| POST | /api/applications | Client | Start application |
| GET | /api/applications/:id | All | Application detail |
| POST | /api/applications/:id/submit | Client | Submit application |
| POST | /api/upload | Client | Upload document |
| GET | /api/upload/download/:uploadId | All | Download file |
| GET | /api/upload/master-documents | All | List master docs |
| GET | /api/admin/applications | Admin | All applications |
| GET | /api/admin/applications/:id | Admin | Application + files |
| GET | /api/admin/stats | Admin | Dashboard stats |

---

## 🔐 System Flow

**Admin:**
1. Login → Admin Dashboard
2. Create Form → Redirected to Form Builder
3. Add Sections (Personal Details, Documents, etc.)
4. Add Document Requirements per section
5. Review submitted applications, download files

**Client:**
1. Login → Client Dashboard
2. View available forms with Apply button
3. Click Apply → Dynamic form loads
4. Upload required documents (drag & drop supported)
5. Submit → Status changes to Submitted
