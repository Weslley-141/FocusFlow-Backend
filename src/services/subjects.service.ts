import { AppDataSource } from '../config/data-source';
import { Subject } from '../entities/Subject';
import { AppError } from '../utils/AppError';
import { has, optString, reqString } from '../utils/validators';

const repo = () => AppDataSource.getRepository(Subject);
const notFound = () => new AppError('Matéria não encontrada', 404);

export const subjectsService = {
  async list(userId: number) {
    return repo()
      .createQueryBuilder('s')
      .loadRelationCountAndMap('s.topicsCount', 's.topics')
      .where('s.userId = :userId', { userId })
      .orderBy('s.createdAt', 'DESC')
      .addOrderBy('s.id', 'DESC')
      .getMany();
  },

  async stats(userId: number) {
    const totalSubjects = await repo().count({ where: { userId } });
    const activeSubjects = await repo().count({ where: { userId, isActive: true } });
    return { totalSubjects, activeSubjects };
  },

  async getById(userId: number, id: number) {
    const subject = await repo().findOne({ where: { id, userId }, relations: { topics: true }, order: { topics: { name: 'ASC' } } });
    if (!subject) throw notFound();
    return { ...subject, topicsCount: subject.topics?.length ?? 0 };
  },

  async create(userId: number, body: any) {
    const subject = repo().create({
      userId,
      name: reqString(body?.name, 'Nome da matéria'),
      description: optString(body?.description, 'Descrição'),
      color: has(body, 'color') && body.color ? reqString(body.color, 'Cor', 20) : '#3B82F6',
      isActive: has(body, 'isActive') ? !!body.isActive : true,
    });
    const saved = await repo().save(subject);
    return { ...saved, topicsCount: 0 };
  },

  async update(userId: number, id: number, body: any) {
    const subject = await repo().findOne({ where: { id, userId } });
    if (!subject) throw notFound();
    if (has(body, 'name')) subject.name = reqString(body.name, 'Nome da matéria');
    if (has(body, 'description')) subject.description = optString(body.description, 'Descrição');
    if (has(body, 'color') && body.color) subject.color = reqString(body.color, 'Cor', 20);
    if (has(body, 'isActive')) subject.isActive = !!body.isActive;
    await repo().save(subject);
    return subjectsService.getById(userId, id);
  },

  async remove(userId: number, id: number) {
    const subject = await repo().findOne({ where: { id, userId } });
    if (!subject) throw notFound();
    await repo().remove(subject); // RN-05: tópicos e flashcards saem em cascata
  },
};
