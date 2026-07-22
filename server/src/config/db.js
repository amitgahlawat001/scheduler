const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  console.log('MongoDB connected');
}

module.exports = connectDB;
