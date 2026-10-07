import { IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Flashcard } from '../entities/Flashcard';
import { FlashcardReview } from '../entities/FlashcardReview';
import { Subject } from '../entities/Subject';
import { Topic } from '../entities/Topic';
import { AppError } from '../utils/AppError';
import { addDays, todayStr } from '../utils/date';
import { has, optId, reqString } from '../utils/validators';

const repo = () => AppDataSource.getRepository(Flashcard);
const notFound = () => new AppError('Flashcard não encontrado', 404);
const RELATIONS = { subject: true, topic: true } as const;

/**
 * O front envia 4 botões (0-3). Mapeamos para a escala SM-2 (0-5):
 * Novamente(0)->0, Difícil(1)->3, Bom(2)->4, Fácil(3)->5.
 */
const UI_TO_SM2: Record<number, { q: number; result: string }> = {
  0: { q: 0, result: 'again' },
  1: { q: 3, result: 'hard' },
  2: { q: 4, result: 'good' },
  3: { q: 5, result: 'easy' },
};

/** Resolve e valida matéria/tópico do usuário. Se só o tópico vier, herda a matéria dele. */
async function resolveLinks(userId: number, rawSubjectId: unknown, rawTopicId: unknown) {
  let subjectId = optId(rawSubjectId, 'subjectId');
  const topicId = optId(rawTopicId, 'topicId');
  if (topicId) {
    const topic = await AppDataSource.getRepository(Topic).findOne({ where: { id: topicId, userId } });
    if (!topic) throw new AppError('Tópico não encontrado', 404);
    if (subjectId && topic.subjectId !== subjectId) throw new AppError('O tópico não pertence à matéria selecionada', 400);
    subjectId = topic.subjectId;
  } else if (subjectId) {
    const subject = await AppDataSource.getRepository(Subject).findOne({ where: { id: subjectId, userId } });
    if (!subject) throw new AppError('Matéria não encontrada', 404);
  }
  return { subjectId, topicId };
}

export const flashcardsService = {
  async list(userId: number) {
    return repo().find({ where: { userId }, relations: RELATIONS, order: { createdAt: 'DESC', id: 'DESC' } });
  },

  /** RN-07: só entram na fila cartões com nextReview <= hoje. */
  async due(userId: number) {
    return repo().find({
      where: { userId, nextReview: LessThanOrEqual(todayStr()) },
      relations: RELATIONS,
      order: { nextReview: 'ASC', id: 'ASC' },
    });
  },

  async stats(userId: number) {
    const [totalCards, dueForReview, newCards, masteredCards] = await Promise.all([
      repo().count({ where: { userId } }),
      repo().count({ where: { userId, nextReview: LessThanOrEqual(todayStr()) } }),
      repo().count({ where: { userId, lastReviewedAt: IsNull() } }),
      repo().count({ where: { userId, interval: MoreThanOrEqual(21) } }), // "dominado" = intervalo >= 21 dias
    ]);
    return { totalCards, dueForReview, newCards, masteredCards };
  },

  async getById(userId: number, id: number) {
    const card = await repo().findOne({ where: { id, userId }, relations: RELATIONS });
    if (!card) throw notFound();
    return card;
  },

  async create(userId: number, body: any) {
    const front = reqString(body?.front, 'Frente do flashcard', 5000);
    const back = reqString(body?.back, 'Verso do flashcard', 5000);
    const { subjectId, topicId } = await resolveLinks(userId, body?.subjectId, body?.topicId);
    const saved = await repo().save(
      repo().create({
        userId, front, back, subjectId, topicId,
        easeFactor: 2.5, interval: 1, repetitions: 0,
        nextReview: todayStr(), lastReviewedAt: null,
      }),
    );
    return flashcardsService.getById(userId, saved.id);
  },

  async update(userId: number, id: number, body: any) {
    const card = await repo().findOne({ where: { id, userId } });
    if (!card) throw notFound();
    if (has(body, 'front')) card.front = reqString(body.front, 'Frente do flashcard', 5000);
    if (has(body, 'back')) card.back = reqString(body.back, 'Verso do flashcard', 5000);
    if (has(body, 'subjectId') || has(body, 'topicId')) {
      const { subjectId, topicId } = await resolveLinks(userId, body.subjectId, body.topicId);
      card.subjectId = subjectId;
      card.topicId = topicId;
    }
    // zera as relações carregadas para o TypeORM usar os ids
    delete (card as Partial<Flashcard>).subject;
    delete (card as Partial<Flashcard>).topic;
    await repo().save(card);
    return flashcardsService.getById(userId, id);
  },

  /** RN-06: SM-2. Qualidade < 3 reinicia o intervalo para o dia seguinte. */
  async review(userId: number, id: number, body: any) {
    const card = await repo().findOne({ where: { id, userId } });
    if (!card) throw notFound();

    const mapped = UI_TO_SM2[Number(body?.quality)];
    if (!mapped) throw new AppError('Qualidade inválida: use 0 (Novamente), 1 (Difícil), 2 (Bom) ou 3 (Fácil)', 400);
    const { q, result } = mapped;

    if (q < 3) {
      card.repetitions = 0;
      card.interval = 1;
    } else {
      if (card.repetitions === 0) card.interval = 1;
      else if (card.repetitions === 1) card.interval = 6;
      else card.interval = Math.max(1, Math.round(card.interval * card.easeFactor));
      card.repetitions += 1;
      card.easeFactor = Math.max(1.3, card.easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    }
    card.nextReview = addDays(todayStr(), card.interval);
    card.lastReviewedAt = new Date();

    await AppDataSource.transaction(async (m) => {
      await m.save(card);
      await m.save(m.create(FlashcardReview, { flashcardId: card.id, quality: q, result }));
    });
    return flashcardsService.getById(userId, id);
  },

  async history(userId: number, id: number) {
    const card = await repo().findOne({ where: { id, userId } });
    if (!card) throw notFound();
    return AppDataSource.getRepository(FlashcardReview).find({
      where: { flashcardId: id },
      order: { reviewedAt: 'DESC', id: 'DESC' },
    });
  },

  async remove(userId: number, id: number) {
    const card = await repo().findOne({ where: { id, userId } });
    if (!card) throw notFound();
    await repo().remove(card);
  },
};
