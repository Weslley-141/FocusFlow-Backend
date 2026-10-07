import { AppDataSource } from '../config/data-source';
import { GoalStatus, GoalType, StudyGoal } from '../entities/StudyGoal';
import { AppError } from '../utils/AppError';
import { ds, isDateStr, todayStr } from '../utils/date';
import { has, optString, posInt, reqString } from '../utils/validators';

const repo = () => AppDataSource.getRepository(StudyGoal);
const notFound = () => new AppError('Meta não encontrada', 404);
const TYPES: GoalType[] = ['daily', 'weekly', 'monthly'];

/**
 * Datas saem como ISO com horário (início ao meio-dia UTC, fim às 23:59:59 UTC) para o front
 * não "voltar um dia" ao converter para o fuso local; `split("T")[0]` continua dando YYYY-MM-DD.
 */
function toDto(g: StudyGoal) {
  const progress = g.targetMinutes > 0 ? Math.min(100, Math.round((g.currentMinutes / g.targetMinutes) * 1000) / 10) : 0;
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    type: g.type,
    targetMinutes: g.targetMinutes,
    currentMinutes: g.currentMinutes,
    progress,
    status: g.status,
    startDate: `${ds(g.startDate)}T12:00:00.000Z`,
    endDate: `${ds(g.endDate)}T23:59:59.000Z`,
    createdAt: g.createdAt,
  };
}

async function find(userId: number, id: number) {
  const goal = await repo().findOne({ where: { id, userId } });
  if (!goal) throw notFound();
  return goal;
}

function applyCompletion(goal: StudyGoal) {
  if (goal.status === 'active' && goal.currentMinutes >= goal.targetMinutes) goal.status = 'completed';
}

export const goalsService = {
  async list(userId: number) {
    const goals = await repo().find({ where: { userId }, order: { createdAt: 'DESC', id: 'DESC' } });
    return goals.map(toDto);
  },

  async active(userId: number) {
    const goals = await repo().find({ where: { userId, status: 'active' as GoalStatus }, order: { endDate: 'ASC', id: 'ASC' } });
    return goals.map(toDto);
  },

  async stats(userId: number) {
    const goals = await repo().find({ where: { userId } });
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const failedGoals = goals.filter((g) => g.status === 'failed').length;
    const activeGoals = goals.filter((g) => g.status === 'active').length;
    return {
      totalGoals,
      completedGoals,
      failedGoals,
      activeGoals,
      completionRate: totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0,
      totalMinutesCompleted: goals.reduce((sum, g) => sum + g.currentMinutes, 0),
    };
  },

  async getById(userId: number, id: number) {
    return toDto(await find(userId, id));
  },

  async create(userId: number, body: any) {
    const type = body?.type;
    if (!TYPES.includes(type)) throw new AppError('Tipo da meta deve ser daily, weekly ou monthly', 400);
    if (!isDateStr(body?.startDate) || !isDateStr(body?.endDate)) throw new AppError('Datas de início e fim inválidas', 400);
    const startDate = body.startDate.slice(0, 10);
    const endDate = body.endDate.slice(0, 10);
    if (endDate < startDate) throw new AppError('A data final deve ser igual ou posterior à data inicial', 400); // RN-10
    const goal = repo().create({
      userId,
      title: reqString(body?.title, 'Título da meta'),
      description: optString(body?.description, 'Descrição'),
      type,
      targetMinutes: posInt(body?.targetMinutes, 'Meta em minutos', 1, 100000),
      currentMinutes: 0,
      startDate,
      endDate,
      status: 'active',
    });
    return toDto(await repo().save(goal));
  },

  async update(userId: number, id: number, body: any) {
    const goal = await find(userId, id);
    if (has(body, 'title')) goal.title = reqString(body.title, 'Título da meta');
    if (has(body, 'description')) goal.description = optString(body.description, 'Descrição');
    if (has(body, 'targetMinutes')) goal.targetMinutes = posInt(body.targetMinutes, 'Meta em minutos', 1, 100000);
    if (has(body, 'type')) {
      if (!TYPES.includes(body.type)) throw new AppError('Tipo da meta deve ser daily, weekly ou monthly', 400);
      goal.type = body.type;
    }
    if (has(body, 'startDate')) {
      if (!isDateStr(body.startDate)) throw new AppError('Data de início inválida', 400);
      goal.startDate = body.startDate.slice(0, 10);
    }
    if (has(body, 'endDate')) {
      if (!isDateStr(body.endDate)) throw new AppError('Data final inválida', 400);
      goal.endDate = body.endDate.slice(0, 10);
    }
    if (ds(goal.endDate) < ds(goal.startDate)) throw new AppError('A data final deve ser igual ou posterior à data inicial', 400);
    applyCompletion(goal);
    return toDto(await repo().save(goal));
  },

  async updateProgress(userId: number, id: number, body: any) {
    const goal = await find(userId, id);
    if (goal.status !== 'active') throw new AppError('Só é possível registrar progresso em metas ativas', 400);
    goal.currentMinutes += posInt(body?.minutesToAdd, 'Minutos', 1, 10000);
    applyCompletion(goal);
    return toDto(await repo().save(goal));
  },

  async markAsFailed(userId: number, id: number) {
    const goal = await find(userId, id);
    if (goal.status !== 'active') throw new AppError('Só é possível marcar metas ativas como não cumpridas', 400);
    goal.status = 'failed';
    return toDto(await repo().save(goal));
  },

  /** RN-11: sessão Pomodoro concluída soma minutos nas metas ativas cujo período inclui hoje. */
  async addSessionMinutes(userId: number, minutes: number) {
    const today = todayStr();
    const goals = await repo().find({ where: { userId, status: 'active' as GoalStatus } });
    const affected = goals.filter((g) => ds(g.startDate) <= today && today <= ds(g.endDate));
    for (const g of affected) {
      g.currentMinutes += minutes;
      applyCompletion(g);
    }
    if (affected.length) await repo().save(affected);
  },

  async remove(userId: number, id: number) {
    await repo().remove(await find(userId, id));
  },
};
