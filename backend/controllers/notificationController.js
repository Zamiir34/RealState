const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');

exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const filter = { user: req.user.id };
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user.id, isRead: false }),
  ]);

  res.status(200).json({ success: true, count: notifications.length, total, unreadCount, data: notifications });
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return next(new ErrorResponse('Notification not found', 404));
  res.status(200).json({ success: true, data: notification });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!notification) return next(new ErrorResponse('Notification not found', 404));
  res.status(200).json({ success: true, message: 'Notification deleted' });
});
