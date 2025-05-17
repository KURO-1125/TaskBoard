# TaskBoard Pro

## Project Introduction

TaskBoard Pro is an advanced project collaboration platform that combines Kanban-style task management with powerful workflow automation capabilities. Built with modern web technologies, it enables teams to streamline their project workflows through customizable automation rules and real-time collaboration features.

---

## Features

### Core Features
- 🔐 User Authentication with Google OAuth (Firebase)
- 📊 Project Management
  - Create and manage projects
  - Invite team members
- ✅ Task Management
  - Create and assign tasks
  - Kanban-style board view
  - Custom status workflows
- ⚡ Workflow Automation
  - Custom automation rules
  - Trigger-based actions
  - Real-time notifications

### Bonus Features
- 💭 Task commenting system

---

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- Tailwind CSS for styling
- Firebase Authentication


### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication

---

## Project Structure

```
taskboard-pro/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store and slices
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
│
└── server/                # Backend Node.js application
    ├── src/
    │   ├── controllers/  # Route controllers
    │   ├── models/       # Mongoose models
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   └── utils/        # Utility functions
    └── config/           # Configuration files
```

---

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  owner: ObjectId, // Reference to User
  members: [ObjectId], // Array of User references
  statuses: [String], // Custom statuses
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  project: ObjectId, // Reference to Project
  assignee: ObjectId, // Reference to User
  status: String,
  dueDate: Date,
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Automation Model
```javascript
{
  _id: ObjectId,
  project: ObjectId, // Reference to Project
  trigger: {
    type: String, // 'status_change', 'assignment', 'due_date'
    conditions: Object
  },
  actions: [{
    type: String, // 'assign_badge', 'change_status', 'send_notification'
    params: Object
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Documentation

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/invite` - Invite user to project

### Tasks
- `GET /api/projects/:projectId/tasks` - List project tasks
- `POST /api/projects/:projectId/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

### Automations
- `GET /api/projects/:projectId/automations` - List project automations
- `POST /api/projects/:projectId/automations` - Create automation
- `PUT /api/automations/:id` - Update automation
- `DELETE /api/automations/:id` - Delete automation

---

## Automation Examples

### Example 1: Task Completion Badge
```json
{
  "trigger": {
    "type": "status_change",
    "conditions": {
      "newStatus": "Done"
    }
  },
  "actions": [
    {
      "type": "assign_badge",
      "params": {
        "badgeType": "task_completion",
        "userId": "{{task.assignee}}"
      }
    }
  ]
}
```

### Example 2: Auto-Progress on Assignment
```json
{
  "trigger": {
    "type": "assignment",
    "conditions": {
      "userId": "specific_user_id"
    }
  },
  "actions": [
    {
      "type": "change_status",
      "params": {
        "newStatus": "In Progress"
      }
    }
  ]
}
```

### Example 3: Due Date Notification
```json
{
  "trigger": {
    "type": "due_date",
    "conditions": {
      "timeframe": "24h_before"
    }
  },
  "actions": [
    {
      "type": "send_notification",
      "params": {
        "recipient": "{{task.assignee}}",
        "message": "Task '{{task.title}}' is due in 24 hours"
      }
    }
  ]
}
```

---

## Video Demo

A 3-5 minute demo video is available on Loom/YouTube:

- [Demo Video Link](https://your-demo-link.com)

**The demo covers:**
- User login with Google OAuth
- Project creation and team invitation
- Task creation and movement between statuses
- Automation trigger demonstration

---

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```
3. Set up environment variables:
   - Create `.env` files in both client and server directories
   - Add necessary environment variables (see .env.example files)
4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

---


