# Deployment Checklist

## Pre-Deployment
- [ ] Set up PostgreSQL database
- [ ] Get database connection string
- [ ] Generate secure JWT secret
- [ ] Test application locally

## Backend Deployment
- [ ] Create Render Web Service
- [ ] Set Root Directory to 'backend'
- [ ] Set Build Command to 'npm install'
- [ ] Set Start Command to 'npm start'
- [ ] Add environment variables
- [ ] Deploy and get backend URL

## Frontend Deployment
- [ ] Create Render Static Site
- [ ] Set Root Directory to 'frontend'
- [ ] Set Build Command to 'echo "Static frontend - no build required"'
- [ ] Deploy and get frontend URL

## Post-Deployment
- [ ] Update backend FRONTEND_URL environment variable
- [ ] Update frontend/js/config.js with backend URL
- [ ] Test API endpoints
- [ ] Test frontend-backend communication
- [ ] Set up database schema (if needed)

## URLs to Update
- Backend URL: https://your-backend-name.onrender.com
- Frontend URL: https://your-frontend-name.onrender.com
- Update frontend/js/config.js line 13 with your backend URL
