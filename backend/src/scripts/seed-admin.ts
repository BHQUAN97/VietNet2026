/**
 * Seed admin user cho local development.
 * Chay: npx ts-node -r tsconfig-paths/register src/scripts/seed-admin.ts
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { generateUlid } from '../common/helpers/ulid.helper';

dotenv.config();

const ADMIN_EMAIL = 'admin@vietnet.local';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'VietNet Admin';

async function seed() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'vietnet',
    synchronize: false,
  });

  await ds.initialize();

  // Kiem tra da ton tai chua
  const existing = await ds.query(
    'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
    [ADMIN_EMAIL],
  );

  if (existing.length > 0) {
    console.log('Admin account already exists. Skipping.');
    await ds.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const id = generateUlid();

  await ds.query(
    `INSERT INTO users (id, full_name, email, password_hash, role, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'super_admin', 'active', NOW(), NOW())`,
    [id, ADMIN_NAME, ADMIN_EMAIL, passwordHash],
  );

  console.log('Admin account created successfully!');
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Role:     super_admin`);

  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
