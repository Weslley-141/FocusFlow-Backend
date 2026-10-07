import { AppDataSource } from '../config/data-source';
import { PomodoroSession } from '../entities/PomodoroSession';
import { Topic } from '../entities/Topic';
import { AppError } from '../utils/AppError';
import { optId, posInt } from '../utils/validators';
import { goalsService } from './goals.service';

const repo = () => AppDataSource.getRepository(PomodoroSession);
const notFound = () => new AppError('Sessão não encontrada', 404);

async function find(userId: number, id: number) {
  const session = await repo().findOne({ where: { id, userId } });
  if (!session) throw notFound();
  return session;
}

export const pomodoroService = {
  /** RN-09: padrão 25 min de foco e 5 de pausa — valores em minutos, configuráveis. */
  async create(userId: number, body: any) {
    const duration = posInt(body?.duration ?? 25, 'Duração', 1, 240);
    const breakTime = posInt(body?.breakTime ?? 5, 'Pausa', 0, 120);
    const topicId = optId(body?.topicId, 'topicId');
    if (topicId) {
      const topic = await AppDataSource.getRepository(Topic).findOne({ where: { id: topicId, userId } });
      if (!topic) throw new AppError('Tópico não encontrado', 404);
    }
    return repo().save(
      repo().create({ userId, duration, breakTime, topicId, startTime: new Date(), endTime: null, completed: false, sessionType: 'focus' }),
    );
  },

  async list(userId: number) {
    return repo().find({ where: { userId }, order: { startTime: 'DESC', id: 'DESC' } });
  },

  async completed(userId: number) {
    return repo().find({ where: { userId, completed: true }, order: { startTime: 'DESC', id: 'DESC' } });
  },

  async active(userId: number) {
    return (await repo().findOne({ where: { userId, completed: false }, order: { startTime: 'DESC', id: 'DESC' } })) ?? null;
  },

  async getById(userId: number, id: number) {
    return find(userId, id);
  },

  /** RN-08: registra término e atualiza as metas (RN-11). */
  async complete(userId: number, id: number) {
    const session = await find(userId, id);
    if (session.completed) return session;
    session.completed = true;
    session.endTime = new Date();
    const saved = await repo().save(session);
    await goalsService.addSessionMinutes(userId, session.duration);
    return saved;
  },

  async stats(userId: number) {
    const totalSessions = await repo().count({ where: { userId } });
    const completedSessions = await repo().count({ where: { userId, completed: true } });
    const raw = await repo()
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.duration), 0)', 'sum')
      .where('p.userId = :userId AND p.completed = :c', { userId, c: true })
      .getRawOne();
    return { totalMinutes: Number(raw?.sum ?? 0), totalSessions, completedSessions };
  },

  async remove(userId: number, id: number) {
    await repo().remove(await find(userId, id));
  },
};
