# TeamTask Pro 🚀

A high-performance, full-stack Project Management SaaS built using the **MERN Stack** (MongoDB, Express, React, Node.js). Designed for teams that prioritize security, organization, and real-time productivity.

![Landing Page MERN](https://via.placeholder.com/1200x600/1e1e1e/6366f1?text=TeamTask+Pro+SaaS+Platform)

## ✨ Premium Features

### 🔒 Enterprise-Grade Security
- **JWT-Based Authentication**: Secure stateless session management.
- **Email OTP Verification**: Real-time account activation via 6-digit codes sent through Nodemailer.
- **Secure Password Recovery**: One-click reset links delivered directly to the user's Gmail.
- **Session Protection**: Automatic session clearing on browser close for maximum security.

### 👥 Role-Based Access Control (RBAC)
- **Admin Role**: Full oversight. Create projects, manage tasks, assign team members, and view global analytics.
- **Member Role**: Focused productivity. View assigned work, update progress via Kanban, and track individual performance.

### 📊 Modern Project Management
- **Interactive Kanban Board**: Drag-and-drop workflow simulation with real-time progress bar synchronization.
- **Real-time Analytics**: Beautiful dashboard stat cards and charts showing project health.
- **Overdue Tracking**: Intelligent system that automatically flags projects and tasks passing their deadlines.
- **Glassmorphism UI**: A stunning, modern design inspired by top-tier SaaS products like Linear and Vercel.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS (Vanilla CSS approach), Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas (Cloud).
- **Security**: JWT, Bcrypt, Nodemailer.
- **Deployment**: Railway.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed.
- MongoDB Atlas account.
- Gmail App Password (for email features).

### 2. Environment Setup

#### Server (.env)
Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

#### Client (.env)
Create a `.env` file in the `client` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/team-task-manager.git

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 4. Running the App

```bash
# Run Server
cd server
npm run dev

# Run Client
cd client
npm run dev
```

---

## 🎥 Presentation Guide (For Recruiters)

When demoing this project, follow this flow to highlight technical depth:

1. **The Auth Flow**: Register a new user and show the **Real OTP** arriving in your Gmail inbox. This proves you can handle third-party integrations.
2. **Admin Dashboard**: Show the **Overdue Badges** and global analytics. Create a project and assign it to a member.
3. **The Kanban Board**: Switch to a Member account, move a task to 'Completed,' and show how the **Progress Bar** updates instantly.
4. **The Reset Flow**: Demonstrate the **One-Click Password Reset Link** to show mastery of secure URL routing.

---

## 👨‍💻 Author
**[Kashaboina Harini]**  
*MERN Stack Developer*

"Building scalable solutions that bridge the gap between complex logic and beautiful design."
