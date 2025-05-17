# TaskBoard Pro

An advanced task collaboration platform with workflow automation capabilities.

## Features

### Core Features
- 🔐 User Authentication with Google OAuth (Firebase)
- 📊 Project Management
  - Create and manage projects
  - Invite team members
  - Role-based access control
- ✅ Task Management
  - Create and assign tasks
  - Kanban-style board view
  - Custom status workflows
- ⚡ Workflow Automation
  - Custom automation rules
  - Trigger-based actions
  - Real-time notifications

### Bonus Features
- 💬 Real-time updates using WebSockets
- 💭 Task commenting system
- 🏆 User achievement badges

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- Tailwind CSS for styling
- Firebase Authentication
- Socket.io-client for real-time features

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication

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

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 