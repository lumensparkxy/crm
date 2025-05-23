const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const database = require('./src/database');

const PORT = process.env.PORT || 8080;
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database before setting up routes
async function startServer() {
  try {
    await database.connect();
    
    // Setup routes
    const customers = require('./src/customers');
    app.use('/customers', customers);

    const album = require('./src/album');
    app.use('/albums', album);

    const director = require('./src/director');
    app.use('/directors', director);

    const singer = require('./src/singer');
    app.use('/singers', singer);

    const twitter = require('./src/twitter');
    app.use('/twitter', twitter);

    // Health check endpoints
    app.get('/', (req, res) => {
      res.json({ 
        success: true,
        message: 'Welcome to the CRM RESTful services',
        version: '2.0.0',
        timestamp: new Date().toISOString()
      });
    });

    app.get('/ping', (req, res) => {
      res.json({ 
        success: true,
        message: 'Pong! Server is healthy',
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Global error handler:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down gracefully...');
      await database.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
