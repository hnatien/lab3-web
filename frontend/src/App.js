import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { API_BASE_URL } from './config';

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
      setError('Không thể tải danh sách. Kiểm tra server.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError('Cần nhập tên công việc');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '' });
      setSuccess('Đã thêm công việc!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
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
      setError('Không thể cập nhật');
      console.error('Error updating task:', err);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!window.confirm('Xóa công việc này?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
      setSuccess('Đã xóa!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Không thể xóa');
      console.error('Error deleting task:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
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
        <h1>Danh sách công việc</h1>
        <p>Quản lý công việc đơn giản</p>
      </div>

      {/* Add Task Form */}
      <div className="todo-form">
        <form onSubmit={addTask}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Tên công việc *</label>
              <input
                type="text"
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Nhập tên công việc..."
                required
              />
            </div>
            <div className="form-group">
              <button type="submit" className="btn">
                Thêm
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description">Ghi chú (tùy chọn)</label>
            <textarea
              id="description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Ghi chú thêm..."
              rows="2"
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
          <div className="loading">Đang tải...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>Chưa có công việc nào!</h3>
            <p>Thêm công việc đầu tiên ở trên.</p>
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
                    {task.completed ? 'Hoàn thành' : 'Làm'}
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="btn btn-danger"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="todo-date">
                Tạo: {formatDate(task.createdAt)}
                {task.updatedAt !== task.createdAt && (
                  <span> • Sửa: {formatDate(task.updatedAt)}</span>
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