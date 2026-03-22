# AMS Frontend - React

Application Management System React Frontend

## Features

- User authentication (Login/Register)
- Admin dashboard with statistics and form management
- Client portal for form applications
- Dynamic form builder
- Application tracking and status management
- Responsive design with Tailwind CSS

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL (default: `http://localhost:5000/api`)

## Running the Application

### Development Mode
```bash
npm start
```

The application will open at `http://localhost:3000`

### Production Build
```bash
npm build
```

## Project Structure

```
src/
├── pages/           # Page components
├── components/      # Reusable components
├── api/            # API service layer
├── App.js          # Main app component
└── index.js        # Entry point
```

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Forms
- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get form by ID
- `POST /api/forms` - Create form (Admin)
- `PUT /api/forms/:id` - Update form (Admin)
- `DELETE /api/forms/:id` - Delete form (Admin)

### Applications
- `POST /api/applications/submit/:formId` - Submit application
- `GET /api/applications` - Get all applications (Admin)
- `GET /api/applications/my-applications` - Get user's applications
- `PUT /api/applications/:id/status` - Update status (Admin)

### Admin Stats
- `GET /api/admin/stats/forms` - Forms statistics
- `GET /api/admin/stats/applications` - Applications statistics

## Technologies Used

- React 18+
- React Router DOM 6+
- Axios for HTTP requests
- Tailwind CSS for styling
- JWT for authentication

## Notes

- Backend API should be running on `http://localhost:5000`
- All API calls are authenticated with JWT tokens stored in localStorage
- Token is automatically refreshed in request interceptor
- Unauthorized requests redirect to login page
