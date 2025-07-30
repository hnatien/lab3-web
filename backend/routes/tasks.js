const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const mongoose = require('mongoose');

// Middleware to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log('Invalid ObjectId format:', req.params.id);
    return res.status(400).json({ message: 'Invalid task ID format' });
  }
  next();
};

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET single task
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching single task:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST new task
router.post('/', async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description || ''
  });

  try {
    const newTask = await task.save();
    console.log('New task created:', newTask._id);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update task
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found for update:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.completed !== undefined) task.completed = req.body.completed;

    const updatedTask = await task.save();
    console.log('Task updated:', req.params.id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
});

// PATCH toggle task completion
router.patch('/:id/toggle', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found for toggle:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    const updatedTask = await task.save();
    console.log('Task toggled:', req.params.id, 'completed:', task.completed);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE task
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    console.log('Attempting to delete task:', req.params.id);
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found for deletion:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    console.log('Task deleted successfully:', req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;