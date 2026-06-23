const mongoose = require('mongoose');

const ensureDb = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: 'Database is not connected. Check MONGODB_URI on Render and Atlas network access (allow 0.0.0.0/0).',
  });
};

module.exports = ensureDb;
