import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: ''
  });

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Please check if the backend server is running.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '' });
      setSuccess('Task added successfully!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    }
  };

  // Toggle task completion
  const toggleTask = async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/tasks/${id}/toggle`);
      setTasks(tasks.map(task => 
        task._id === id ? response.data : task
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
      setSuccess('Task deleted successfully!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>Todo App</h1>
        <p>Manage your tasks with ease</p>
      </div>

      {/* Add Task Form */}
      <div className="todo-form">
        <form onSubmit={addTask}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title..."
                required
              />
            </div>
            <div className="form-group">
              <button type="submit" className="btn">
                Add Task
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description..."
              rows="3"
            />
          </div>
        </form>
      </div>

      {/* Messages */}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Task List */}
      <div className="todo-list">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet!</h3>
            <p>Add your first task above to get started.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task._id} 
              className={`todo-item ${task.completed ? 'completed' : ''}`}
            >
              <div className="todo-header">
                <div>
                  <h3 className="todo-title">{task.title}</h3>
                  {task.description && (
                    <p className="todo-description">{task.description}</p>
                  )}
                </div>
                <div className="todo-actions">
                  <button
                    onClick={() => toggleTask(task._id)}
                    className={`btn ${task.completed ? 'btn-secondary' : ''}`}
                  >
                    {task.completed ? 'Undo' : 'Complete'}
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="todo-date">
                Created: {formatDate(task.createdAt)}
                {task.updatedAt !== task.createdAt && (
                  <span> • Updated: {formatDate(task.updatedAt)}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;