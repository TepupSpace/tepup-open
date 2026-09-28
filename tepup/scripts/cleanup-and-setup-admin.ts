/**
 * Script dọn dẹp tài khoản email-based + tạo admin
 * Chạy: cd tepup && CONFIRM_WIPE=yes npx tsx scripts/cleanup-and-setup-admin.ts
 *
 * Chạy trên từng DB bằng cách đổi DATABASE_URL trong .env
 *
 * CẢNH BÁO: script xóa TOÀN BỘ user trong DB đang trỏ tới.
 * Cần ADMIN_USERNAME, ADMIN_PASSWORD và CONFIRM_WIPE=yes trong env.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Cần set ${name} trong .env`);
  return value;
}

const ADMIN_USERNAME = requireEnv('ADMIN_USERNAME');
const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD');

/** Host của DB đang trỏ tới, để người chạy thấy rõ mình sắp xóa DB nào. */
function targetHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '(không parse được DATABASE_URL)';
  }
}

async function main() {
  console.log('=== Tepup: Cleanup & Setup Admin ===');
  console.log(`DB host: ${targetHost(connectionString)}\n`);

  // Step 1: Xóa tất cả user
  console.log('--- Step 1: Xóa tất cả tài khoản ---');
  const allExisting = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true },
  });

  console.log(`Tìm thấy ${allExisting.length} tài khoản:`);
  for (const u of allExisting) {
    console.log(`  - ${u.username || u.email || '(no name)'} (role: ${u.role})`);
  }

  if (allExisting.length > 0) {
    if (process.env.CONFIRM_WIPE !== 'yes') {
      throw new Error(
        `Sắp xóa ${allExisting.length} tài khoản trên ${targetHost(connectionString)}. ` +
          'Chạy lại với CONFIRM_WIPE=yes nếu thực sự muốn.'
      );
    }
    const deleteResult = await prisma.user.deleteMany({});
    console.log(`Đã xóa ${deleteResult.count} tài khoản.\n`);
  } else {
    console.log('Không có tài khoản nào.\n');
  }

  // Step 2: Create/update admin account
  console.log('--- Step 2: Tạo/cập nhật tài khoản admin ---');
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { username: ADMIN_USERNAME },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin',
      },
    });
    console.log(`Admin "${ADMIN_USERNAME}" đã tồn tại — cập nhật password + role.\n`);
  } else {
    await prisma.user.create({
      data: {
        username: ADMIN_USERNAME,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`Tạo admin: ${ADMIN_USERNAME}\n`);
  }

  // Step 3: Verify
  console.log('--- Step 3: Xác nhận ---');
  const allUsers = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`Tổng users: ${allUsers.length}`);
  for (const u of allUsers) {
    console.log(`  - username: ${u.username || '(none)'}, email: ${u.email || '(none)'}, role: ${u.role}`);
  }

  console.log('\n=== Done ===');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
