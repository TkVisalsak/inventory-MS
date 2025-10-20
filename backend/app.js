import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import inventoryRoutes from './routes/inventory-route.js';
import authRoutes from './routes/auth.route.js';
import calculateRoutes from './routes/calculate.route.js';
dotenv.config();

const app = express();
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5501',
    'https://inventory-ms-1-9me0.onrender.com'  // Add your frontend URL
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

app.use(cookieParser());

// Root route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Inventory Management API is running!', 
    status: 'success',
    endpoints: {
      inventory: '/api/inventory',
      auth: '/api/auth',
      calculate: '/api/calculate'
    }
  });
});

app.use('/api/inventory', inventoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calculate', calculateRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

//Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass