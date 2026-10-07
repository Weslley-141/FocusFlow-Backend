import { AppDataSource } from '../config/data-source';
import { Subject } from '../entities/Subject';
import { Topic } from '../entities/Topic';
import { AppError } from '../utils/AppError';
import { has, optString, reqString, toId } from '../utils/validators';

const repo = () => AppDataSource.getRepository(Topic);
const notFound = () => new AppError('Tópico não encontrado', 404);

async function assertSubject(userId: number, subjectId: number) {
  const subject = await AppDataSource.getRepository(Subject).findOne({ where: { id: subjectId, userId } });
  if (!subject) throw new AppError('Matéria não encontrada', 404);
  return subject;
}

export const topicsService = {
  async listBySubject(userId: number, subjectId: number) {
    await assertSubject(userId, subjectId);
    return repo().find({ where: { subjectId, userId }, order: { name: 'ASC' } });
  },

  async getById(userId: number, id: number) {
    const topic = await repo().findOne({ where: { id, userId } });
    if (!topic) throw notFound();
    return topic;
  },

  async create(userId: number, body: any) {
    const subjectId = toId(body?.subjectId, 'subjectId');
    await assertSubject(userId, subjectId);
    const topic = repo().create({
      userId,
      subjectId,
      name: reqString(body?.name, 'Nome do tópico'),
      description: optString(body?.description, 'Descrição'),
    });
    return repo().save(topic);
  },

  async update(userId: number, id: number, body: any) {
    const topic = await topicsService.getById(userId, id);
    if (has(body, 'name')) topic.name = reqString(body.name, 'Nome do tópico');
    if (has(body, 'description')) topic.description = optString(body.description, 'Descrição');
    return repo().save(topic);
  },

  async remove(userId: number, id: number) {
    const topic = await topicsService.getById(userId, id);
    await repo().remove(topic); // flashcards do tópico saem em cascata
  },
};
