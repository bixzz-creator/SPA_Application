import { connectDatabase } from './config/database';
import { config } from './config/config';
import { createApp } from './app';

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`🚀 AccessHub API running on http://localhost:${config.port}`);
    console.log(`📖 API Docs: http://localhost:${config.port}/api-docs`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
