require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const taskRoutes = require('./src/routes/task.routes');
const subtaskRoutes = require('./src/routes/subtask.routes');
const commentRoutes = require('./src/routes/comment.routes');
const activityRoutes = require('./src/routes/activity.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:taskId/subtasks', subtaskRoutes);
app.use('/api/tasks/:taskId/comments', commentRoutes);
app.use('/api/tasks/:taskId/activity', activityRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});