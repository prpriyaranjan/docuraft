const { execSync } = require('child_process');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push', { stdio: 'inherit' });
} catch (error) {
  console.warn('Prisma setup skipped during install. Run npx prisma generate and npx prisma db push manually if needed.');
}
