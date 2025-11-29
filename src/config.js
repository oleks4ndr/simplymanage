import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env is in the project root
config({ path: path.resolve(__dirname, '../.env') });


// needed in .env

// for DB
/*
DB_HOST
DB_USER
DB_PASS
DB_NAME


// extra
PORT

SESSION_SECRET
*/