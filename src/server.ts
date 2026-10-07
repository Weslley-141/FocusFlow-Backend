import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { env } from './config/env';
import app from './app';

async function bootstrap() {
  if (!env.jwtSecret) throw new Error('Defina JWT_SECRET no .env antes de iniciar o servidor.');
  if (!env.autoVerify && (!env.emailUser || !env.emailPass)) {
    console.warn('⚠️  AUTO_VERIFY=false e EMAIL_USER/EMAIL_PASS vazios: o cadastro vai falhar ao enviar o e-mail de verificação.');
  }
  await AppDataSource.initialize();
  console.log('✅ Banco de dados conectado');
  app.listen(env.port, () => console.log(`🚀 FocusFlow API rodando na porta ${env.port}`));
}

bootstrap().catch((err) => {
  console.error('❌ Falha ao iniciar o servidor:', err);
  process.exit(1);
});
