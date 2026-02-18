# True Style - Full Stack E-Commerce Application

A modern, full-stack e-commerce platform built with cutting-edge technologies for seamless shopping experiences.

## Tech Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS, Emotion
- **HTTP Client:** Axios
- **Data Management:** TanStack React Query
- **Forms:** React Hook Form
- **Routing:** React Router v7
- **Charts:** Recharts
- **Notifications:** React Toastify
- **Build Tool:** Vite

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Server:** Uvicorn
- **Database:** PostgreSQL (SQLAlchemy ORM), MongoDB (Motor)
- **Caching:** Redis
- **Authentication:** JWT, Passlib, Python-Jose
- **Email:** Fastapi-Mail, AIOSMTPLIB
- **Payments:** Razorpay
- **Task Scheduling:** APScheduler
- **API Documentation:** OpenAPI/Swagger
- **AI Integration:** OpenAI

## Project Structure

```
true_style/
├── frontend/                 # React + TypeScript frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature modules
│   │   ├── services/        # API service calls
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
└── backend/                  # FastAPI backend application
    ├── app/
    │   ├── api/            # API routes and dependencies
    │   ├── crud/           # Database operations
    │   ├── models/         # Database models
    │   ├── schemas/        # Pydantic validation schemas
    │   ├── services/       # Business logic
    │   ├── middleware/     # Middleware handlers
    │   ├── core/           # Config, database, security
    │   └── main.py         # FastAPI application setup
    ├── scripts/            # Utility scripts (seeding, etc.)
    ├── docs/               # API documentation
    └── requirements.txt    # Backend dependencies
```

## Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.12+ (for backend)
- **PostgreSQL** 12+ (database)
- **Redis** (caching)
- **MongoDB** (optional, for document storage)

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL (PostgreSQL connection)
# - REDIS_URL (Redis connection)
# - SECRET_KEY (JWT secret)
# - EMAIL credentials
# - Payment gateway keys (Razorpay)


# Start backend server
uvicorn main:app --reload
# Server runs on http://localhost:8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env
# Edit .env with your configuration:
# - VITE_API_URL (Backend API URL)

# Start development server
npm run dev
# Application runs on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
# Activate venv first (see installation steps)
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting
```

## Environment Configuration

Both frontend and backend require `.env` files. Examples are provided:

- **Backend:** `backend/.env.example` → Copy to `backend/.env`
- **Frontend:** `frontend/.env.example` → Copy to `frontend/.env`

Key environment variables to configure:
- Database connection strings
- Redis configuration
- JWT secrets
- API endpoints
- Third-party service credentials

## API Documentation

Once the backend is running, access the API documentation:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Features

- User authentication and authorization
- Product catalog with categories
- Shopping cart and wishlist management
- Order management and tracking
- Payment integration (Razorpay)
- Return and exchange system
- User reviews and ratings
- Admin dashboard
- Email notifications
- Caching for improved performance
