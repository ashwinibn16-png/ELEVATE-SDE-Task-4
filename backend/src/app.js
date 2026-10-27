import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import applicationRoutes from './routes/applicationRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(','),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Certificate Issuing & Verification Platform API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount Resource Routes
app.use('/api/applications', applicationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
