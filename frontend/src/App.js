import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { API_BASE_URL } from './config';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState('');

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, {
        title: newTask,
        description: ''
      });
      setTasks([response.data, ...tasks]);
      setNewTask('');
      setError(null);
    } catch (err) {
      setError('Không thể thêm công việc');
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
      if (err.response && err.response.status === 404) {
        // Task not found, refresh the list
        fetchTasks();
      } else {
        setError('Không thể cập nhật');
        console.error('Error updating task:', err);
      }
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      console.log('Attempting to delete task:', id);
      const response = await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      console.log('Delete response:', response.data);
      
      // Remove from local state
      setTasks(tasks.filter(task => task._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      
      if (err.response && err.response.status === 404) {
        // Task not found, remove from local state anyway
        setTasks(tasks.filter(task => task._id !== id));
        console.log('Task not found on server, removed from local state');
      } else {
        setError('Không thể xóa');
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="container">
      <h1>To-Do List</h1>
      
      <form onSubmit={addTask} className="add-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..."
          className="task-input"
        />
        <button type="submit" className="add-btn">
          Add
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="task-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task._id} 
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <div 
                className="task-content"
                onClick={() => toggleTask(task._id)}
              >
                <span className="task-checkbox">
                  {task.completed ? '✓' : '○'}
                </span>
                <span className="task-text">
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task._id)}
                className="delete-btn"
                title="Delete task"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;