# TaskFlow Pro 🚀

A full-stack project management and IT helpdesk system built with React, Node.js, PostgreSQL and Prisma.

## Note

This project was built with AI-assisted development to accelerate learning and delivery.

## ✨ Features

### Project Management
- ✅ Create and manage projects with team members
- ✅ Task assignment with status tracking (Todo, In Progress, In Review, Done)
- ✅ Real-time updates every 5 seconds
- ✅ Comments and activity log on every task
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Due date tracking with overdue alerts

### Role-Based Access Control
- 👑 **Admin** — Full system access, manage all users
- 👔 **Manager** — Create projects, assign tasks, manage helpdesk
- 👤 **Team Member** — View assigned tasks, update status, add comments

### IT Helpdesk System
- 🎫 Public ticket submission (no login required)
- 📊 Live ticket status tracking
- 🔔 Real-time updates for ticket submitters
- 📝 Internal notes (visible to IT team only)
- ✅ Resolution tracking

### UI/UX
- 🌙 Dark / Light mode
- 📱 Responsive design
- ⚡ Real-time data updates
- 🎨 Clean modern interface

## 🛠️ Tech Stack

**Frontend:** React 18 · Vite · TailwindCSS · TanStack React Query · Zustand · Axios · React Router v6 · Lucide React  
**Backend:** Node.js · Express.js · Prisma ORM · PostgreSQL · JWT Authentication · bcryptjs · Nodemailer

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Nikjin22/taskflow-pro.git
cd taskflow-pro

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

npx prisma db push
npx prisma generate
node prisma/seed.js
npm run dev

# 3. Setup Frontend (new terminal)
cd ../frontend
npm install
npm run dev

# 4. Open browser
# http://localhost:5173
