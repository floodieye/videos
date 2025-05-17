require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes.js'); 
const videoRoutes = require('./routes/videoRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../public')); // Для обслуживания статических файлов

// Подключение роутов
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));