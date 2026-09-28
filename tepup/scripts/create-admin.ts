/**
 * Script để tạo admin user
 * Chạy: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Create Prisma client with adapter (required for Prisma 7)
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Cần set ${name} trong .env`);
  return value;
}

const ADMIN_EMAIL = requireEnv('ADMIN_EMAIL');
const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD');

async function main() {
  const email = ADMIN_EMAIL;
  const password = ADMIN_PASSWORD;
  const name = 'Admin';

  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists!');
    console.log(`   Email: ${email}`);

    // Update to ADMIN role if not already
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      console.log('   Updated role to ADMIN');
    }
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('');
  console.log('   Email:    ', email);
  console.log('   Password: (lấy từ ADMIN_PASSWORD trong env)');
  console.log('');
  console.log('⚠️  IMPORTANT: Đổi password sau khi đăng nhập lần đầu!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
