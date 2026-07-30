# TaskFlow Pro

> Full-stack project management and IT helpdesk system

A modern web application for managing projects, tasks, and IT support tickets with role-based access control.

## Note

This project was built with AI-assisted development to accelerate learning and delivery.

## Tech Stack

**Frontend:** React 18 · Vite · TailwindCSS · Zustand · React Query  
**Backend:** Node.js · Express.js · Prisma ORM  
**Database:** PostgreSQL

## Features

- Project and task management with role-based access control
- Real-time updates (5-second polling)
- IT Helpdesk ticketing system
- Dark & Light mode toggle
- Admin panel with user management

## Demo Credentials

| Role    | Email                     | Password      |
|---------|---------------------------|---------------|
| Admin   | admin@taskflow.app        | Admin@1234    |
| Manager | manager@taskflow.app      | Manager@1234  |
| Member  | alice@taskflow.app        | Member@1234   |

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Nikjin22/taskflow-pro.git
cd taskflow-pro

# 2. Start the backend
cd backend
npm install
cp .env.example .env
npx prisma db push
node prisma/seed.js
npm run dev

# 3. Start the frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Open the app
# http://localhost:5173
