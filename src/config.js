import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only load .env file in development
// In production (Render), environment variables are already set by the platform
if (process.env.NODE_ENV !== 'production') {
  config({ path: path.resolve(__dirname, '../.env') });
}
