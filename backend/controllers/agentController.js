const Agent = require('../models/Agent');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ErrorResponse } = require('../middleware/errorHandler');
const createNotification = require('../utils/createNotification');

exports.createAgentProfile = asyncHandler(async (req, res, next) => {
  const existing = await Agent.findOne({ user: req.user.id });
  if (existing) return next(new ErrorResponse('Agent profile already exists', 400));

  const agent = await Agent.create({ ...req.body, user: req.user.id });
  await User.findByIdAndUpdate(req.user.id, { role: 'agent' });

  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await createNotification(admin._id, 'New Agent Registration', `${req.user.name} registered as an agent.`, 'info');
  }

  res.status(201).json({ success: true, data: agent });
});

exports.getAgents = asyncHandler(async (req, res) => {
  const { search, isApproved, page = 1, limit = 10 } = req.query;
  const query = {};
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';

  let agents = Agent.find(query).populate('user', 'name email phone avatar');

  if (search) {
    agents = agents.populate({
      path: 'user',
      match: { name: { $regex: search, $options: 'i' } },
    });
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    agents.sort('-createdAt').skip(skip).limit(Number(limit)),
    Agent.countDocuments(query),
  ]);

  res.status(200).json({ success: true, count: data.length, total, pages: Math.ceil(total / limit), data });
});

exports.getAgent = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findById(req.params.id).populate('user', 'name email phone avatar');
  if (!agent) return next(new ErrorResponse('Agent not found', 404));
  res.status(200).json({ success: true, data: agent });
});

exports.getMyAgentProfile = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findOne({ user: req.user.id }).populate('user', 'name email phone avatar');
  if (!agent) return next(new ErrorResponse('Agent profile not found', 404));
  res.status(200).json({ success: true, data: agent });
});

exports.updateAgent = asyncHandler(async (req, res, next) => {
  let agent = await Agent.findOne({ user: req.user.id });
  if (!agent && req.user.role === 'admin') {
    agent = await Agent.findById(req.params.id);
  }
  if (!agent) return next(new ErrorResponse('Agent profile not found', 404));

  Object.assign(agent, req.body);
  await agent.save();
  res.status(200).json({ success: true, data: agent });
});

exports.approveAgent = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findById(req.params.id).populate('user');
  if (!agent) return next(new ErrorResponse('Agent not found', 404));

  agent.isApproved = true;
  await agent.save();
  await createNotification(agent.user._id, 'Agent Approved', 'Your agent profile has been approved.', 'success');
  res.status(200).json({ success: true, data: agent });
});

exports.getAgentStats = asyncHandler(async (req, res, next) => {
  const agent = await Agent.findOne({ user: req.user.id });
  if (!agent) return next(new ErrorResponse('Agent profile not found', 404));

  const Property = require('../models/Property');
  const Appointment = require('../models/Appointment');

  const [totalListings, activeListings, appointments, soldCount] = await Promise.all([
    Property.countDocuments({ agent: agent._id }),
    Property.countDocuments({ agent: agent._id, status: 'available' }),
    Appointment.countDocuments({ agent: agent._id }),
    Property.countDocuments({ agent: agent._id, status: 'sold' }),
  ]);

  res.status(200).json({
    success: true,
    data: { totalListings, activeListings, appointments, soldCount, rating: agent.rating },
  });
});
