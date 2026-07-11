# Ghibli-Inspired Task Management

A premium, minimal, and beautifully animated Task Management application inspired by Studio Ghibli. Built with React (Vite) and Python FastAPI.

## Features
- **Magical Dynamic Background**: Beautiful Ghibli-themed backgrounds.
- **Clean Minimal UI**: Glassmorphism design with a focus on simplicity and elegance.
- **Task Management**: Full CRUD functionality (Create, Read, Update, Delete) with Priorities, Categories, and Days.
- **Weekly Planner**: Filter tasks easily by the day of the week.
- **Interactive Analog Clock**: Custom CSS-driven real-time ticking clock.
- **Daily Wisdom**: Beautiful, elegant quotes that change on load.
- **Secure Authentication**: JWT-based secure user login and registration system.

## Tech Stack
- **Frontend**: React (Vite), CSS (Glassmorphism), Framer Motion, Chart.js, Lucide Icons.
- **Backend**: Python FastAPI, MongoDB (Motor), Passlib (bcrypt), PyJWT.

## Running Locally

### Backend Setup
1. Create a virtual environment: `python3 -m venv venv`
2. Activate it: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install "fastapi[all]" motor pymongo "passlib[bcrypt]" pyjwt bcrypt==3.2.2`
4. Start the server: `uvicorn app:app --reload`
*(The backend runs on `http://localhost:8000`)*

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install Node dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
*(The frontend runs on `http://localhost:5173`)*

## Database Setup
Make sure you have MongoDB running locally on `localhost:27017`. No additional database configuration is required; the app creates the necessary database and collections automatically.
