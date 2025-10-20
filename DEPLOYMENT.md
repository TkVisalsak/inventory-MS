# Inventory Management System - Render Deployment Guide

This guide will help you deploy the Inventory Management System to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A PostgreSQL database (you can use Render's managed PostgreSQL or external service like Neon)
3. Your database connection string

## Deployment Steps

### 1. Backend Deployment

1. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Choose "Web Service"
   - Set the following:
     - **Name**: `inventory-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Root Directory**: `backend`

2. **Environment Variables:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Will be set after frontend deployment

3. **Deploy the backend** and note the URL (e.g., `https://inventory-backend-xyz.onrender.com`)

### 2. Frontend Deployment

1. **Create a new Static Site on Render:**
   - Connect your GitHub repository
   - Choose "Static Site"
   - Set the following:
     - **Name**: `inventory-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `echo "Static frontend - no build required"`
     - **Publish Directory**: `.`

2. **Update Backend CORS:**
   - Go to your backend service settings
   - Update `FRONTEND_URL` to your frontend URL (e.g., `https://inventory-frontend-xyz.onrender.com`)

3. **Update Frontend API Configuration:**
   - After both services are deployed, update `frontend/js/config.js`:
   ```javascript
   window.API_CONFIG.BASE_URL = 'https://your-backend-url.onrender.com';
   ```

### 3. Database Setup

1. **Create a PostgreSQL database** (using Render's managed PostgreSQL or external service)
2. **Set up your database schema** (you'll need to run your database migrations)
3. **Update the `DATABASE_URL`** in your backend environment variables

### 4. Environment Variables Summary

**Backend Environment Variables:**
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secure-jwt-secret-here
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Optional (for Telegram notifications):**
```
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

## Manual Deployment Alternative

If you prefer to deploy manually:

1. **Deploy Backend:**
   - Upload the `backend` folder to Render
   - Set environment variables
   - Deploy

2. **Deploy Frontend:**
   - Upload the `frontend` folder to Render
   - Set as static site
   - Update the API URL in `frontend/js/config.js`

## Post-Deployment

1. **Test the API endpoints** using your backend URL
2. **Verify the frontend** can connect to the backend
3. **Set up monitoring** and logging as needed

## Troubleshooting

- **CORS Issues**: Make sure `FRONTEND_URL` is set correctly in backend
- **Database Connection**: Verify `DATABASE_URL` is correct
- **API Calls Failing**: Check that the frontend is using the correct backend URL

## URLs After Deployment

- **Frontend**: `https://inventory-frontend-xyz.onrender.com`
- **Backend API**: `https://inventory-backend-xyz.onrender.com`
- **API Health Check**: `https://inventory-backend-xyz.onrender.com/api/inventory/getcategories`

## Security Notes

- Use strong, unique passwords for your database
- Generate a secure JWT secret
- Consider setting up SSL certificates
- Regularly update dependencies
