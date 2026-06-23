const Appointment = require('../models/Appointment');
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const { sendSMS } = require('../utils/sendSMS');
const createNotification = require('../utils/createNotification');

exports.createAppointment = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.body.property).populate('owner');
  if (!property) return next(new ErrorResponse('Property not found', 404));

  const appointmentData = {
    ...req.body,
    buyer: req.user.id,
    agent: property.agent,
  };

  const appointment = await Appointment.create(appointmentData);
  await appointment.populate([
    { path: 'property', select: 'title' },
    { path: 'buyer', select: 'name email phone' },
  ]);

  const dateStr = new Date(req.body.date).toLocaleDateString();
  await sendEmail({
    email: property.owner.email,
    subject: 'New Appointment Booking',
    html: emailTemplates.appointmentBooked(property.owner.name, property.title, dateStr, req.body.time),
  });
  await createNotification(
    property.owner._id,
    'New Appointment',
    `Visit scheduled for "${property.title}" on ${dateStr}`,
    'appointment'
  );

  if (property.owner.phone) {
    await sendSMS(property.owner.phone, `New visit booked for ${property.title} on ${dateStr} at ${req.body.time}`);
  }

  res.status(201).json({ success: true, data: appointment });
});

exports.getAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (req.user.role === 'buyer') filter.buyer = req.user.id;
  else if (req.user.role === 'agent') {
    const agent = await Agent.findOne({ user: req.user.id });
    if (agent) filter.agent = agent._id;
  } else if (req.user.role === 'owner') {
    const properties = await Property.find({ owner: req.user.id }).select('_id');
    filter.property = { $in: properties.map((p) => p._id) };
  }

  if (status) filter.status = status;
  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('property', 'title images city price')
      .populate('buyer', 'name email phone')
      .populate({ path: 'agent', populate: { path: 'user', select: 'name' } })
      .sort('date')
      .skip(skip)
      .limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: appointments.length, total, pages: Math.ceil(total / limit), data: appointments });
});

exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('property')
    .populate('buyer', 'name email phone')
    .populate({ path: 'agent', populate: { path: 'user', select: 'name email phone' } });

  if (!appointment) return next(new ErrorResponse('Appointment not found', 404));
  res.status(200).json({ success: true, data: appointment });
});

exports.updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  const appointment = await Appointment.findById(req.params.id).populate('buyer', 'name email phone');
  if (!appointment) return next(new ErrorResponse('Appointment not found', 404));

  appointment.status = status;
  if (rejectionReason) appointment.rejectionReason = rejectionReason;
  await appointment.save();

  const dateStr = new Date(appointment.date).toLocaleDateString();
  await createNotification(
    appointment.buyer._id,
    `Appointment ${status}`,
    `Your visit on ${dateStr} has been ${status}.`,
    'appointment'
  );

  if (status === 'approved' && appointment.buyer.phone) {
    await sendSMS(
      appointment.buyer.phone,
      `Reminder: Your property visit is confirmed for ${dateStr} at ${appointment.time}.`
    );
  }

  res.status(200).json({ success: true, data: appointment });
});

exports.getCalendarAppointments = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const filter = { date: { $gte: start, $lte: end } };
  if (req.user.role === 'buyer') filter.buyer = req.user.id;
  else if (req.user.role === 'agent') {
    const agent = await Agent.findOne({ user: req.user.id });
    if (agent) filter.agent = agent._id;
  }

  const appointments = await Appointment.find(filter)
    .populate('property', 'title')
    .populate('buyer', 'name');

  res.status(200).json({ success: true, data: appointments });
});

exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new ErrorResponse('Appointment not found', 404));

  if (appointment.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 403));
  }

  appointment.status = 'cancelled';
  await appointment.save();
  res.status(200).json({ success: true, data: appointment });
});
