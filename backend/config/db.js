const mongoose = require('mongoose');

const normalizeMongoUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') {
    throw new Error('MONGODB_URI is not set');
  }

  let uri = rawUri.trim();

  // Render users often paste values wrapped in quotes.
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error(
      'MONGODB_URI must start with mongodb:// or mongodb+srv://. ' +
        'In Render, paste only the connection string from Atlas (no quotes, no spaces).'
    );
  }

  return uri;
};

const connectDB = async () => {
  const uri = normalizeMongoUri(process.env.MONGODB_URI);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
