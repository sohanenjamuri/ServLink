const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

// Basic Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ServiceConnect API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ServiceConnect API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});