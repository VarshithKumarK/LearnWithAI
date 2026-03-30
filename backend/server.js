import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import userRoutes from './routes/userRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import recommenderRoutes from './routes/recommenderRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/user', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/recommender', recommenderRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('PathAI Backend is running');
});

import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
