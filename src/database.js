const { MongoClient } = require('mongodb');
const logger = require('./logger');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://twitterx.organic-farmer.in:27017';
      
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
      });

      await this.client.connect();
      this.db = this.client.db(process.env.DB_NAME || 'crm');
      logger.info('Connected to MongoDB successfully');
      return this.db;
    } catch (error) {
      logger.error('MongoDB connection error:', error.message);
      throw error;
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getCollection(name) {
    return this.getDb().collection(name);
  }

  async close() {
    if (this.client) {
      await this.client.close();
      logger.info('MongoDB connection closed');
    }
  }
}

module.exports = new Database();