import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env['PORT'] || '5000', 10),
  mongoUri: process.env['MONGO_URI'] || 'mongodb://localhost:27017/accesshub',
  jwtSecret: process.env['JWT_SECRET'] || 'fallback_secret_not_for_production',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
  nodeEnv: process.env['NODE_ENV'] || 'development',
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:4200',
};
