# 🧩 Node Express Project Management System REST API

A **RESTful backend API** built with **Node.js**, **Express**, **MongoDB**, and **TypeScript** for managing projects, tasks, subtasks, team members, and notes — all secured with JWT authentication and role-based access control.

## 📘 Overview

The **Project Management System API** enables teams to collaborate efficiently by providing endpoints for:

- Project creation and management
- Task and subtask tracking
- Team member role management
- Project notes
- Secure user authentication

This service serves as the **backend foundation** for a complete project management application.

---

## ⚙️ Tech Stack

| Technology     | Purpose                                     |
| -------------- | ------------------------------------------- |
| **Node.js**    | Runtime environment                         |
| **Express.js** | Web framework for building REST APIs        |
| **MongoDB**    | NoSQL database for data persistence         |
| **TypeScript** | Type safety and better code maintainability |
| **JWT**        | Secure authentication                       |
| **Multer**     | File uploads for task attachments           |
| **Nodemailer** | Email verification and password reset       |
| **bcrypt.js**  | Password hashing and security               |

---

## 🚀 Features

### 👤 Authentication & Authorization

- User registration with email verification
- JWT-based login/logout
- Password reset & change password
- Token refresh system
- Role-based access control: `Admin`, `Project Admin`, `Member`

### 🗂️ Project Management

- Create, update, delete projects (Admin only)
- View all projects with member count
- Access project details

### 👥 Member Management

- Add or remove project members
- Update member roles (Admin only)
- View all project members

### ✅ Task Management

- Create, view, update, and delete tasks
- Assign tasks to members
- Upload multiple file attachments
- Task status tracking (`Todo`, `In Progress`, `Done`)

### 🔄 Subtask Management

- Create, update, and delete subtasks
- Members can mark subtasks as complete

### 📝 Project Notes

- Create and manage project notes (Admin only)
- View and update notes

### 💓 System Health

- `/api/v1/healthcheck` endpoint for system monitoring

---

## 🔐 Permission Matrix

| Feature                    | Admin | Project Admin | Member |
| -------------------------- | ----- | ------------- | ------ |
| Create Project             | ✅    | ❌            | ❌     |
| Update/Delete Project      | ✅    | ❌            | ❌     |
| Manage Project Members     | ✅    | ❌            | ❌     |
| Create/Update/Delete Tasks | ✅    | ✅            | ❌     |
| View Tasks                 | ✅    | ✅            | ✅     |
| Update Subtask Status      | ✅    | ✅            | ✅     |
| Create/Delete Subtasks     | ✅    | ✅            | ❌     |
| Create/Update/Delete Notes | ✅    | ❌            | ❌     |
| View Notes                 | ✅    | ✅            | ✅     |

---

## 📁 Folder Structure (Recommended)

```
node-express-project-management-system-rest-api/
├── src/
│   ├── config/            # Environment & database config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, error handling, validation
│   ├── models/            # Mongoose models
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Helper utilities (email, file handling)
│   └── index.ts           # App entry point
├── .env.example           # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ API Base URL

```
/api/v1/
```

### Example Routes

**Auth Routes**

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/current-user
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password/:token
```

**Project Routes**

```
GET    /api/v1/projects/
POST   /api/v1/projects/
GET    /api/v1/projects/:projectId
PUT    /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId
```

**Task Routes**

```
GET    /api/v1/tasks/:projectId
POST   /api/v1/tasks/:projectId
PUT    /api/v1/tasks/:projectId/t/:taskId
DELETE /api/v1/tasks/:projectId/t/:taskId
```

**Notes**

```
GET    /api/v1/notes/:projectId
POST   /api/v1/notes/:projectId
```

---

## 🧠 Environment Variables

Create a `.env` file in the project root and include:

```env
PORT=5000
MONGO_URI=mongodb+srv://your-db-uri
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
CLIENT_URL=http://localhost:3000
```

---

## 🧩 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/node-express-project-management-system-rest-api.git

# Move into the project directory
cd node-express-project-management-system-rest-api

# Install dependencies
npm install

# Create .env file and add environment variables
cp .env.example .env

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## 🧪 Testing

You can use **Postman** or **Thunder Client** to test API endpoints.  
All routes are prefixed with `/api/v1`.

---

## 📦 Future Enhancements

- ✅ Email notifications for task assignments
- ✅ Activity logs for auditing
- ✅ Pagination and filtering for tasks and projects
- ✅ Cloud file storage (AWS S3, Cloudinary, etc.)
- ✅ WebSocket for real-time task updates

---

## 🤝 Contributing

Contributions are welcome!  
Please fork the repository and submit a pull request with detailed information about your changes.

---

## 🧾 License

This project is licensed under the **MIT License** — free to use and modify.

---

## 💬 Author

**Saddam Arbaa**  
📧 saddamarbaas@gmail.com  
🌐 [GitHub Profile](https://github.com/saddamarbaa)
