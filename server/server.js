import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import binRoutes from './routes/binRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import iotRoutes from './routes/iotRoutes.js';
import gpsRoutes from './routes/gpsRoutes.js';
import robotRoutes from './routes/robotRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();

// Bulletproof CORS Configuration: Supports localhost, local dev IPs, production Vercel, and custom CLIENT_URL
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'https://medi-smart-nu.vercel.app',
  'https://medi-smart.onrender.com',
];

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow server-to-server, curl, Postman
  const clean = origin.replace(/\/+$/, '');
  if (allowedOrigins.includes(clean)) return true;
  // Match any Vercel deployment (*.vercel.app) or Render deployment (*.onrender.com)
  if (/^https:\/\/([a-zA-Z0-9_-]+)\.vercel\.app$/.test(clean)) return true;
  if (/^https:\/\/medi-smart.*\.vercel\.app$/.test(clean)) return true;
  if (/^https:\/\/.*\.onrender\.com$/.test(clean)) return true;
  return false;
};

// 1. Global CORS Headers & Preflight Interceptor
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Permissive fallback so user requests from unexpected preview URLs are never blocked
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers, Access-Control-Request-Method, Access-Control-Request-Headers'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Authorization, Set-Cookie');

  // Immediately terminate preflight OPTIONS requests with 204 No Content
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// 2. Standard CORS middleware for Express compliance
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'MediTrackX API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/robot', robotRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB and then start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[MediTrackX Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start MediTrackX Server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
