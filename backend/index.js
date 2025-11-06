import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from Next.js frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// MongoDB Connection Status
let mongoStatus = 'disconnected';

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('MONGODB_URI not found in environment variables');
      
      return;
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    mongoose.set('strictQuery', true);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      mongoStatus = 'connected';
      console.log('\n✓ MongoDB: Connected successfully');
      console.log(`  Database: ${mongoose.connection.name}`);
      console.log(`  Host: ${mongoose.connection.host}\n`);
    });

    mongoose.connection.on('disconnected', () => {
      mongoStatus = 'disconnected';
      console.log('\n✗ MongoDB: Disconnected\n');
    });

    mongoose.connection.on('error', (err) => {
      mongoStatus = 'error';
      console.error('\n✗ MongoDB Error:', err.message, '\n');
    });

    mongoose.connection.on('reconnected', () => {
      mongoStatus = 'connected';
      console.log('\n✓ MongoDB: Reconnected\n');
    });

    await mongoose.connect(process.env.MONGODB_URI, opts);
  } catch (error) {
    mongoStatus = 'error';
    console.error('\n✗ MongoDB connection error:', error.message, '\n');
  }
};

// Connect to database
connectDB();

const PORT = process.env.BACKEND_PORT || 5000;

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>M-Shop Backend Server</h1>
    <p>Server is running on port: ${PORT}</p>
    <p>Status: Active</p>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    mongodb: {
      status: dbStatusMap[dbStatus] || 'unknown',
      readyState: dbStatus,
      database: mongoose.connection.name || 'N/A',
      host: mongoose.connection.host || 'N/A'
    }
  });
});

// M-Pesa Token Middleware
const tokenMiddleware = async (req, res, next) => {
  const MPESA_BASE_URL =
    process.env.MPESA_ENVIRONMENT === 'live'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  try {
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      return res.status(500).json({
        error: 'M-Pesa credentials not configured',
        message: 'Please set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env file'
      });
    }

    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const resp = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    );

    req.mpesaToken = resp.data.access_token;
    next();
  } catch (error) {
    console.error('M-Pesa token error:', error.message);
    res.status(500).json({
      error: 'Failed to generate M-Pesa token',
      message: error.message
    });
  }
};

// M-Pesa STK Push endpoint
app.post('/api/mpesa/stkpush', tokenMiddleware, async (req, res) => {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({
      error: 'Phone number and amount are required',
    });
  }

  try {
    const MPESA_BASE_URL =
      process.env.MPESA_ENVIRONMENT === 'live'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);

    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString('base64');

    const formattedPhone = `254${phoneNumber.slice(-9)}`;

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://mydomain.com/callback',
        AccountReference: phoneNumber,
        TransactionDesc: 'M-Shop Payment',
      },
      {
        headers: {
          Authorization: `Bearer ${req.mpesaToken}`,
        },
      }
    );

    return res.status(200).json({
      status: 'success',
      message: `STK push sent successfully to ${phoneNumber}`,
      data: response.data,
    });
  } catch (error) {
    console.error('STK Push error:', error.message);
    res.status(500).json({
      error: 'STK push failed',
      message: error.message
    });
  }
});

// M-Pesa Callback endpoint
app.post('/api/mpesa/callback', (req, res) => {
  console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

  try {
    const result = req.body.Body?.stkCallback;

    if (!result) {
      console.log('Invalid callback structure');
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Callback received'
      });
    }

    if (result.ResultCode === 0) {
      console.log('✓ Transaction successful:', result);
      // TODO: Update order status in database
    } else {
      console.log('✗ Transaction failed:', result.ResultDesc);
      // TODO: Handle failed transaction
    }

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  const getMongoStatusDisplay = () => {
    const statusColors = {
      'connected': '\x1b[32m● Connected\x1b[0m',      // Green
      'disconnected': '\x1b[31m● Disconnected\x1b[0m', // Red
      'connecting': '\x1b[33m● Connecting...\x1b[0m',  // Yellow
      'error': '\x1b[31m● Error\x1b[0m',              // Red
      'not configured': '\x1b[33m● Not Configured\x1b[0m' // Yellow
    };
    return statusColors[mongoStatus] || mongoStatus;
  };

  console.log(`
╔═══════════════════════════════════════════════════╗
║          M-Shop Backend Server Running            ║
╠═══════════════════════════════════════════════════╣
║  Port:        ${PORT}                                   ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(35)}║
║  MongoDB:     ${getMongoStatusDisplay()}                 ║
║  Health:      http://localhost:${PORT}/health           ║
╚═══════════════════════════════════════════════════╝
  `);

  // Check MongoDB status after a short delay
  setTimeout(() => {
    if (mongoStatus === 'disconnected' || mongoStatus === 'error') {
      console.log('\x1b[33m⚠ Warning: MongoDB is not connected. Some features may not work.\x1b[0m\n');
    }
  }, 2000);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});