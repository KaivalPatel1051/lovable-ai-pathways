const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connectDB = async () => {
  try {
    // Check if we're in development and MongoDB URI is not provided or is localhost
    const mongoUri = process.env.MONGODB_URI;
    const isLocalhost = !mongoUri || mongoUri.includes('localhost');
    
    if (process.env.NODE_ENV === 'development' && isLocalhost) {
      console.log('🔧 Starting in-memory MongoDB for development...');
      
      // Create in-memory MongoDB instance
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'addiction-recovery-dev'
        }
      });
      
      const uri = mongod.getUri();
      console.log('📦 In-memory MongoDB URI:', uri);
      
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('✅ Connected to in-memory MongoDB for development');
    } else {
      // Use provided MongoDB URI for production
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('✅ Connected to MongoDB');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // Fallback: try to connect without in-memory server
    try {
      console.log('🔄 Attempting fallback connection...');
      await mongoose.connect('mongodb://localhost:27017/addiction-recovery-fallback', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to fallback MongoDB');
    } catch (fallbackError) {
      console.error('❌ Fallback connection failed:', fallbackError);
      console.log('💡 Please install MongoDB or use MongoDB Atlas for production');
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('📴 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
