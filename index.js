require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Use environment variable for PORT or default to 3000
const PORT = process.env.PORT || 3000;

// CORS setup
const allowlist = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://todo-frontend-rosy-one.vercel.app', 'https://todo-frontend-nimmis-projects-deacabf5.vercel.app'];
const corsOptionsDelegate = function (req, callback) {
  const corsOptions = allowlist.includes(req.header('Origin'))
    ? { origin: true } // Allow listed origins
    : { origin: false }; // Block other origins
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(express.json()); // Middleware for parsing JSON

// MongoDB connection
// async function main() {
//   try {
//         await mongoose.connect(process.env.MONGODB_URI, {
//           useNewUrlParser: true,
//           useUnifiedTopology: true,
//         });
//         console.log('MongoDB Connected');
//       } catch (err) {
//         console.error('MongoDB connection error:', err);
//       }
// }
async function main() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }

main();

// Mongoose Schema and Model
const TaskSchema = new mongoose.Schema({
  task: { type: String, required: true },
});
const Task = mongoose.model('Task', TaskSchema);

// API Endpoints

// Create a to-do
app.post('/todos', async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }
  try {
    const newTask = await Task.create({ task });
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Read all to-dos
app.get('/todos', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Read a single to-do
app.get('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'To-Do not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Update a to-do
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { task },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a to-do
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
