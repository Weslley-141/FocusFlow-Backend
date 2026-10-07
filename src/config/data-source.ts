import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Subject } from '../entities/Subject';
import { Topic } from '../entities/Topic';
import { Flashcard } from '../entities/Flashcard';
import { FlashcardReview } from '../entities/FlashcardReview';
import { PomodoroSession } from '../entities/PomodoroSession';
import { StudyGoal } from '../entities/StudyGoal';
import { MindMap } from '../entities/MindMap';
import { MindMapNode } from '../entities/MindMapNode';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'focusflow',
  charset: 'utf8mb4',
  timezone: 'Z',
  ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  // Evita "read ECONNRESET" em bancos serverless (TiDB Cloud) e dá tempo para o banco "acordar".
  connectTimeout: 20000,
  extra: { enableKeepAlive: true },
  synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  logging: process.env.DB_LOGGING === 'true',
  entities: [User, Subject, Topic, Flashcard, FlashcardReview, PomodoroSession, StudyGoal, MindMap, MindMapNode],
});
