# LearnHub - Learning Management System

A modern LMS built with MERN stack featuring role-based access control, dark/light mode, and Google authentication.

## Features

- **Role-based Access**: Student, Instructor, and Admin roles
- **Dark/Light Mode**: Automatic theme switching with user preference
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Modern UI**: Clean and intuitive interface
- **Course Management**: Browse, search, and filter courses
- **Authentication**: JWT-based auth with Google OAuth support
- **Modular Architecture**: Scalable and maintainable codebase

## Tech Stack

### Frontend
- React 19 + Vite
- TailwindCSS for styling
- React Router for navigation
- Tanstack Query for data fetching
- Lucide React for icons
- React Hot Toast for notifications

### Backend
- Node.js + Express
- MySQL with Sequelize ORM
- JWT authentication
- bcryptjs for password hashing
- Express Rate Limiting
- Helmet for security

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Learning_Management_System-main
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Database Setup**
   - Create a MySQL database
   - Update `.env` file with your database credentials
   - The application will automatically sync the database schema

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lms_db
DB_USER=root
DB_PASS=password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
CLIENT_URL=http://localhost:5173
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── index.html
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Courses
- `GET /api/courses` - Get all courses (with pagination and filters)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course (instructor/admin only)

### Development Endpoints
- `GET /api/mock/courses` - Get mock course data
- `GET /api/health` - Health check

## Development

### Running in Development Mode

1. **Backend**: `npm run dev` (uses nodemon for auto-restart)
2. **Frontend**: `npm run dev` (Vite dev server with HMR)

### Building for Production

1. **Frontend**: `npm run build`
2. **Backend**: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.