import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { env } from '../config/env';
import { User } from '../entities/User';
import { AppError } from '../utils/AppError';
import { sendVerificationEmail } from '../utils/mailer';
import { has, reqString } from '../utils/validators';

const users = () => AppDataSource.getRepository(User);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const publicUser = (u: User) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt });

function parseCredentials(body: any) {
  const email = reqString(body?.email, 'E-mail').toLowerCase();
  if (!EMAIL_RE.test(email)) throw new AppError('E-mail inválido', 400);
  const password = typeof body?.password === 'string' ? body.password : '';
  return { email, password };
}

export const authService = {
  async register(body: any) {
    const name = reqString(body?.name, 'Nome', 255);
    const { email, password } = parseCredentials(body);
    if (password.length < 6) throw new AppError('A senha deve ter no mínimo 6 caracteres', 400);

    let user = await users().findOne({ where: { email } });
    if (user && user.isVerified) throw new AppError('E-mail já cadastrado', 409);

    const passwordHash = await bcrypt.hash(password, 10); // RN-03
    const token = crypto.randomBytes(32).toString('hex');
    const isNew = !user;

    if (!user) user = users().create({ email });
    user.name = name;
    user.passwordHash = passwordHash;
    user.isVerified = env.autoVerify;
    user.verificationToken = env.autoVerify ? null : token;
    user.verificationTokenExpires = env.autoVerify ? null : new Date(Date.now() + DAY_MS);
    user = await users().save(user);

    if (env.autoVerify) return { message: 'Conta criada com sucesso! Você já pode fazer login.' };

    try {
      await sendVerificationEmail(user.email, user.name, token);
    } catch (err) {
      console.error('Falha ao enviar e-mail de verificação:', err);
      if (isNew) await users().delete(user.id);
      throw new AppError('Não foi possível enviar o e-mail de verificação. Tente novamente em instantes.', 500);
    }
    return { message: 'Cadastro realizado! Verifique seu e-mail para ativar a conta.' };
  },

  async verifyEmail(token: unknown) {
    if (typeof token !== 'string' || !token) throw new AppError('Token de verificação inválido', 400);
    const user = await users().findOne({ where: { verificationToken: token } });
    if (!user) throw new AppError('Token de verificação inválido ou já utilizado', 400);
    if (user.verificationTokenExpires && user.verificationTokenExpires.getTime() < Date.now()) {
      throw new AppError('Token de verificação expirado. Cadastre-se novamente.', 400);
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await users().save(user);
    return { message: 'E-mail verificado com sucesso! Você já pode fazer login.' };
  },

  async login(body: any) {
    const { email, password } = parseCredentials(body);
    const user = await users().findOne({ where: { email } });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !valid) throw new AppError('E-mail ou senha inválidos', 401);
    if (!user.isVerified) throw new AppError('Verifique seu e-mail antes de fazer login', 403); // RN-01
    const token = jwt.sign({ userId: user.id }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'], // RN-02
    });
    return { token, user: publicUser(user) };
  },

  async getMe(userId: number) {
    const user = await users().findOne({ where: { id: userId } });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return publicUser(user);
  },

  async updateProfile(userId: number, body: any) {
    const user = await users().findOne({ where: { id: userId } });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    if (has(body, 'name')) user.name = reqString(body.name, 'Nome', 255);
    if (has(body, 'password') && body.password) {
      if (typeof body.password !== 'string' || body.password.length < 6) {
        throw new AppError('A senha deve ter no mínimo 6 caracteres', 400);
      }
      user.passwordHash = await bcrypt.hash(body.password, 10);
    }
    return publicUser(await users().save(user));
  },
};
