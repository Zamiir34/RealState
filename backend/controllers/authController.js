const crypto = require('crypto');
const User = require('../models/User');
const { getFileUrl } = require('../utils/fileUrl');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const createNotification = require('../utils/createNotification');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const cookieDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;
  const options = {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  };
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      phone: user.phone,
    },
  });
};

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return next(new ErrorResponse('Email already registered', 400));

  const allowedRoles = ['buyer', 'owner', 'agent'];
  const userRole = allowedRoles.includes(role) ? role : 'buyer';

  const user = await User.create({ name, email, password, role: userRole, phone });
  const verifyToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  await sendEmail({
    email: user.email,
    subject: 'Verify Your Email - RealP Estate',
    html: emailTemplates.welcome(user.name, verifyUrl),
  });

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorResponse('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  if (!user.isActive) return next(new ErrorResponse('Account has been deactivated', 401));

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  sendTokenResponse(user, 200, res);
});

exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fields = ['name', 'phone', 'address'];
  const updates = {};
  fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: user });
});

exports.updateAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ErrorResponse('Please upload an image', 400));
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: getFileUrl(req.file) },
    { new: true }
  );
  res.status(200).json({ success: true, data: user });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse('No user found with that email', 404));

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    email: user.email,
    subject: 'Password Reset - RealP Estate',
    html: emailTemplates.resetPassword(user.name, resetUrl),
  });

  res.status(200).json({ success: true, message: 'Password reset email sent' });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return next(new ErrorResponse('Invalid or expired token', 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    verificationToken,
    verificationTokenExpire: { $gt: Date.now() },
  });
  if (!user) return next(new ErrorResponse('Invalid or expired verification token', 400));

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  await createNotification(user._id, 'Email Verified', 'Your email has been successfully verified.', 'success');
  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

exports.resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user.isVerified) return next(new ErrorResponse('Email already verified', 400));

  const verifyToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  await sendEmail({
    email: user.email,
    subject: 'Verify Your Email - RealP Estate',
    html: emailTemplates.welcome(user.name, verifyUrl),
  });
  res.status(200).json({ success: true, message: 'Verification email sent' });
});
