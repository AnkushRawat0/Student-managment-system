# Coaching Management System

A comprehensive backend API for managing coaching institutes, students, and course enrollments. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**
  - User registration and login
  - Role-based access control (Admin, Coach, Student)
  - JWT token-based authentication

- **Student Management**
  - Create and manage student profiles
  - Track student enrollments and course assignments
  - Monitor fee payment status
  - Batch management system

- **Multi-role System**
  - **Admin**: Full system access and management
  - **Coach**: Course and student management
  - **Student**: Profile and enrollment access

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Development**: nodemon for hot reloading

## 📁 Project Structure

```
coaching_managment_system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── studentController.js  # Student management logic
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication middleware
│   ├── models/
│   │   ├── Student.js           # Student data model
│   │   └── User.js              # User data model
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   └── studentRoutes.js     # Student management endpoints
│   ├── server.js                # Main server file
│   ├── package.json
│   └── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coaching_managment_system
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/coaching_management
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`



## 🛠️ Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (currently not implemented)
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret key for JWT tokens | - |


