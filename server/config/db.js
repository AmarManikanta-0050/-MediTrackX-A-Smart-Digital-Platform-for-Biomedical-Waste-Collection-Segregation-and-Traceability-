import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;

    if (!connUri) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please configure MongoDB Atlas connection in .env');
    }

    const conn = await mongoose.connect(connUri, {
      dbName: 'meditrackx',
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
