const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'info', link = '', metadata = {}) => {
  try {
    await Notification.create({ user: userId, title, message, type, link, metadata });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

module.exports = createNotification;
