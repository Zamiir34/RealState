require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const PropertyCategory = require('../models/PropertyCategory');
const Location = require('../models/Location');
const Settings = require('../models/Settings');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Agent = require('../models/Agent');
    const Property = require('../models/Property');

    await Promise.all([
      User.deleteMany(),
      Agent.deleteMany(),
      Property.deleteMany(),
      PropertyCategory.deleteMany(),
      Location.deleteMany(),
      Settings.deleteMany(),
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@realp.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      phone: '+1234567890',
    });

    const agent = await User.create({
      name: 'John Agent',
      email: 'agent@realp.com',
      password: 'agent123',
      role: 'agent',
      isVerified: true,
      phone: '+1234567891',
    });

    const owner = await User.create({
      name: 'Sarah Owner',
      email: 'owner@realp.com',
      password: 'owner123',
      role: 'owner',
      isVerified: true,
    });

    const buyer = await User.create({
      name: 'Mike Buyer',
      email: 'buyer@realp.com',
      password: 'buyer123',
      role: 'buyer',
      isVerified: true,
    });

    const agentProfile = await Agent.create({
      user: agent._id,
      licenseNumber: 'AGT-2024-001',
      agency: 'RealP Realty',
      bio: 'Experienced real estate agent with 10+ years in the market.',
      experience: 10,
      isApproved: true,
      membershipPlan: 'premium',
      specializations: ['residential', 'commercial'],
    });

    const categories = await PropertyCategory.insertMany([
      { name: 'Residential', slug: 'residential', description: 'Homes and apartments' },
      { name: 'Commercial', slug: 'commercial', description: 'Office and retail spaces' },
      { name: 'Luxury', slug: 'luxury', description: 'Premium properties' },
      { name: 'Land', slug: 'land', description: 'Plots and land' },
    ]);

    await Location.insertMany([
      { city: 'New York', state: 'NY', country: 'USA', latitude: 40.7128, longitude: -74.006 },
      { city: 'Los Angeles', state: 'CA', country: 'USA', latitude: 34.0522, longitude: -118.2437 },
      { city: 'Miami', state: 'FL', country: 'USA', latitude: 25.7617, longitude: -80.1918 },
      { city: 'Chicago', state: 'IL', country: 'USA', latitude: 41.8781, longitude: -87.6298 },
    ]);

    await Settings.create({
      siteName: 'RealP Estate',
      contactEmail: 'contact@realp.com',
      contactPhone: '+1-800-REALP',
      featuredListingPrice: 49.99,
    });

    const agentRecord = await Agent.findOne({ user: agent._id });

    await Property.insertMany([
      {
        title: 'Modern Downtown Apartment',
        propertyType: 'apartment',
        category: categories[0]._id,
        description: 'Stunning modern apartment in the heart of downtown with panoramic city views.',
        price: 450000,
        location: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
        bedrooms: 2,
        bathrooms: 2,
        areaSize: 1200,
        parkingSpaces: 1,
        status: 'available',
        listingType: 'sale',
        amenities: ['gym', 'pool', 'parking', 'security'],
        isFeatured: true,
        isApproved: true,
        approvalStatus: 'approved',
        owner: owner._id,
        agent: agentRecord._id,
        images: [{ url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' }],
      },
      {
        title: 'Luxury Beach Villa',
        propertyType: 'villa',
        category: categories[2]._id,
        description: 'Exclusive beachfront villa with private pool and ocean views.',
        price: 2500000,
        location: '456 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        latitude: 25.7617,
        longitude: -80.1918,
        bedrooms: 5,
        bathrooms: 4,
        areaSize: 4500,
        parkingSpaces: 3,
        status: 'available',
        listingType: 'sale',
        amenities: ['pool', 'garden', 'security', 'smart-home'],
        isFeatured: true,
        isApproved: true,
        approvalStatus: 'approved',
        owner: owner._id,
        agent: agentRecord._id,
        images: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800' }],
      },
      {
        title: 'Cozy Family Home',
        propertyType: 'house',
        category: categories[0]._id,
        description: 'Perfect family home in a quiet suburban neighborhood.',
        price: 3200,
        location: '789 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        bedrooms: 4,
        bathrooms: 3,
        areaSize: 2200,
        parkingSpaces: 2,
        status: 'available',
        listingType: 'rent',
        amenities: ['garden', 'garage', 'fireplace'],
        isApproved: true,
        approvalStatus: 'approved',
        owner: owner._id,
        agent: agentRecord._id,
        images: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' }],
      },
    ]);

    console.log('Seed data created successfully!');
    console.log('Admin: admin@realp.com / admin123');
    console.log('Agent: agent@realp.com / agent123');
    console.log('Owner: owner@realp.com / owner123');
    console.log('Buyer: buyer@realp.com / buyer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
