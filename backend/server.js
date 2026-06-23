const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const mongoSanitize = require('./middleware/mongoSanitize');
const cookieParser = require('cookie-parser');
const ensureDb = require('./middleware/ensureDb');
const { corsMiddleware, corsOptions } = require('./config/cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  const app = express();

  app.set('trust proxy', 1);
  app.use(corsMiddleware);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize);
  app.use('/uploads', express.static('uploads'));

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.method === 'OPTIONS',
      message: { success: false, message: 'Too many requests, please try again later' },
    });

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      skip: (req) => req.method === 'OPTIONS',
      message: { success: false, message: 'Too many auth attempts, please try again later' },
    });

    app.use('/api/auth', authLimiter);
    app.use('/api', limiter);
  }

  app.get('/api/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({
      success: dbConnected,
      message: dbConnected ? 'RealP API is running' : 'API up but database is not connected',
      database: dbConnected ? 'connected' : 'disconnected',
    });
  });

  app.use('/api', ensureDb);

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/agents', require('./routes/agentRoutes'));
  app.use('/api/properties', require('./routes/propertyRoutes'));
  app.use('/api/appointments', require('./routes/appointmentRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/reviews', require('./routes/reviewRoutes'));
  app.use('/api/favorites', require('./routes/favoriteRoutes'));
  app.use('/api/notifications', require('./routes/notificationRoutes'));
  app.use('/api/reports', require('./routes/reportRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));

  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\nPort ${PORT} is already in use. Stop the other process or set PORT in .env\n`);
      process.exit(1);
    }
    throw err;
  });

  return app;
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

module.exports = startServer;
