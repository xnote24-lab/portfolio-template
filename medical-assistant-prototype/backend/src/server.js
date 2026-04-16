import mongoose from 'mongoose';
import {app} from './app.js';
import {env} from './config/env.js';

async function start() {
  await mongoose.connect(env.mongoUri);
  app.listen(env.port, () => {
    console.log(`Medical assistant backend listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
