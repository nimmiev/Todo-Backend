const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

async function main() {
    await mongoose.connect('mongodb+srv://nimmiev222:todo-listpwd@todolist.vyyvz.mongodb.net/?retryWrites=true&w=majority&appName=todolist');
}

main()
.then(res => {console.log('MongoDB Connected')})
.catch(err => console.log(err));

const TaskSchema = new mongoose.Schema({
    task: String
});
const Task = mongoose.model('Task', TaskSchema);

// Middleware for parsing JSON
app.use(express.json());

let todos = [];

// create a to-do
app.post('/todos', async (req, res) => {
    const { task } = req.body; // Destructure `task` from the request body
    if (!task) {
        return res.status(400).json({ error: 'Task is required' });
    }

    try {
        const newTask = await Task.create({ task });
        res.status(201).json(newTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});


// read all to-dos
app.get('/todos', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.json(tasks); // Each task will have a `task` field
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});


// single to-do read
app.get('/todos/:id', (req, res) => {
    const { id } = req.params;
    const todo = todos.find((t) => t.id === parseInt(id));
    if (!todo) {
        return res.status(404).json({ error: 'To-Do not found' });
    }
    res.json(todo);
});

// update a to-do
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { task, completed } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { task, completed },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(updatedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});


// delete a to-do
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(deletedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});