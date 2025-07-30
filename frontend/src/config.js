// API Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'https://todo-backend-tf0p.onrender.com'
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'https://todo-backend-tf0p.onrender.com/api'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL; 