// server/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Пример маршрутов
router.get('/', videoController.getAllVideos);
router.post('/upload', videoController.uploadVideo);

module.exports = router;