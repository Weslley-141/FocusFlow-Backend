import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:3001')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
  autoVerify: process.env.AUTO_VERIFY === 'true',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  timezone: process.env.APP_TIMEZONE || 'America/Recife',
};
