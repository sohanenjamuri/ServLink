require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany();
    await Service.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Create providers
    const providers = await User.insertMany([
      { name: 'CleanPro Services', email: 'cleanpro@example.com', password, role: 'provider', category: 'Cleaning', location: 'Downtown', verified: true, rating: 4.8, reviews: 124 },
      { name: 'FixIt Plumbing', email: 'fixit@example.com', password, role: 'provider', category: 'Home Repair', location: 'Westside', verified: true, rating: 4.9, reviews: 89 },
      { name: 'LearnSmart Tutoring', email: 'learnsmart@example.com', password, role: 'provider', category: 'Tutoring', location: 'University District', verified: true, rating: 4.7, reviews: 56 },
    ]);

    // Create services
    await Service.insertMany([
      { name: 'House Cleaning', category: 'Cleaning', price: '$50', rating: 4.8, provider: providers[0]._id },
      { name: 'Deep Carpet Clean', category: 'Cleaning', price: '$100', rating: 4.5, provider: providers[0]._id },
      { name: 'Plumbing Repair', category: 'Home Repair', price: '$80', rating: 4.9, provider: providers[1]._id },
      { name: 'Math Tutoring', category: 'Tutoring', price: '$40', rating: 4.7, provider: providers[2]._id },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
