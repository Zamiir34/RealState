const Property = require('../models/Property');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const { generatePDF, generateExcel } = require('../utils/exportReport');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProperties,
    availableProperties,
    soldProperties,
    rentedProperties,
    totalAgents,
    totalUsers,
    monthlyRevenue,
    newListings,
  ] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ status: 'available' }),
    Property.countDocuments({ status: 'sold' }),
    Property.countDocuments({ status: 'rented' }),
    Agent.countDocuments({ isApproved: true }),
    User.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Property.countDocuments({ createdAt: { $gte: startOfMonth } }),
  ]);

  const pendingApprovals = await Property.countDocuments({ approvalStatus: 'pending' });
  const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

  res.status(200).json({
    success: true,
    data: {
      totalProperties,
      availableProperties,
      soldProperties,
      rentedProperties,
      totalAgents,
      totalUsers,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      newListings,
      pendingApprovals,
      pendingAppointments,
    },
  });
});

exports.getPropertyReport = asyncHandler(async (req, res) => {
  const { format = 'json', status, city } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (city) filter.city = city;

  const properties = await Property.find(filter)
    .populate('owner', 'name')
    .select('title city status price listingType createdAt');

  if (format === 'pdf') {
    const headers = ['Title', 'City', 'Status', 'Price', 'Type', 'Date'];
    const rows = properties.map((p) => [
      p.title, p.city, p.status, p.price, p.listingType, p.createdAt.toLocaleDateString(),
    ]);
    return generatePDF(res, 'Property Listings Report', headers, rows, 'property-report');
  }
  if (format === 'excel') {
    const headers = ['Title', 'City', 'Status', 'Price', 'Type', 'Date'];
    const rows = properties.map((p) => [
      p.title, p.city, p.status, p.price, p.listingType, p.createdAt.toLocaleDateString(),
    ]);
    return generateExcel(res, 'Properties', headers, rows, 'property-report');
  }

  res.status(200).json({ success: true, count: properties.length, data: properties });
});

exports.getSalesReport = asyncHandler(async (req, res) => {
  const properties = await Property.find({ status: 'sold' })
    .populate('owner', 'name')
    .populate({ path: 'agent', populate: { path: 'user', select: 'name' } });

  const totalSales = properties.reduce((sum, p) => sum + p.price, 0);

  if (req.query.format === 'pdf') {
    const headers = ['Title', 'City', 'Price', 'Owner', 'Agent', 'Date'];
    const rows = properties.map((p) => [
      p.title, p.city, p.price, p.owner?.name, p.agent?.user?.name || 'N/A', p.updatedAt.toLocaleDateString(),
    ]);
    return generatePDF(res, 'Sales Report', headers, rows, 'sales-report');
  }

  res.status(200).json({ success: true, totalSales, count: properties.length, data: properties });
});

exports.getRentalReport = asyncHandler(async (req, res) => {
  const properties = await Property.find({ status: 'rented', listingType: 'rent' });
  const totalRent = properties.reduce((sum, p) => sum + p.price, 0);
  res.status(200).json({ success: true, totalRent, count: properties.length, data: properties });
});

exports.getAgentPerformanceReport = asyncHandler(async (req, res) => {
  const agents = await Agent.find({ isApproved: true }).populate('user', 'name email');

  const report = await Promise.all(
    agents.map(async (agent) => {
      const [listings, sold, rented] = await Promise.all([
        Property.countDocuments({ agent: agent._id }),
        Property.countDocuments({ agent: agent._id, status: 'sold' }),
        Property.countDocuments({ agent: agent._id, status: 'rented' }),
      ]);
      return {
        name: agent.user.name,
        email: agent.user.email,
        listings,
        sold,
        rented,
        rating: agent.rating,
        propertiesSold: agent.propertiesSold,
      };
    })
  );

  if (req.query.format === 'excel') {
    const headers = ['Name', 'Email', 'Listings', 'Sold', 'Rented', 'Rating'];
    const rows = report.map((r) => [r.name, r.email, r.listings, r.sold, r.rented, r.rating]);
    return generateExcel(res, 'Agent Performance', headers, rows, 'agent-performance');
  }

  res.status(200).json({ success: true, data: report });
});

exports.getRevenueReport = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  const revenue = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31, 23, 59, 59),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  res.status(200).json({ success: true, data: revenue });
});

exports.getChartData = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [listings, revenue, users] = await Promise.all([
    Property.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.status(200).json({ success: true, data: { listings, revenue, users } });
});
