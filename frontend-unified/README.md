# Northwind Health - Frontend

Modern React frontend with MUI components and Phosphor Icons for Face ID authentication.

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Features

- ✅ Email/Password Authentication
- ✅ Face ID Registration & Login
- ✅ MUI Components (Button, TextField, Card, Dialog, etc.)
- ✅ Phosphor Icons
- ✅ Responsive Design (Mobile/Tablet/Desktop)
- ✅ Protected Routes with React Router

## Project Structure

```
src/
├── services/          # API & Face Recognition services
├── hooks/             # Custom React hooks (useAuth)
├── components/        # Reusable MUI components
├── pages/             # Page components
├── layout/            # Layout wrappers
├── theme/             # MUI theme configuration
├── router.jsx         # React Router config
└── App.jsx            # Main App component
```

## Build

```bash
npm run build    # Create production build
npm run preview  # Preview production build
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)
- `VITE_APP_NAME` - Application name

## Backend

The frontend connects to a FastAPI backend at `http://localhost:5000`

Endpoints:

- `POST /check-email` - Check if email exists
- `POST /register` - Register new user
- `POST /login/password` - Password login
- `POST /login/face` - Face ID login
