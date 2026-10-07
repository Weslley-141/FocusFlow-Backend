import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok } from '../utils/response';
import { toId } from '../utils/validators';
import { flashcardsService } from '../services/flashcards.service';

export const flashcardsController = {
  list: asyncHandler(async (req, res) => ok(res, await flashcardsService.list(req.userId))),
  due: asyncHandler(async (req, res) => ok(res, await flashcardsService.due(req.userId))),
  stats: asyncHandler(async (req, res) => ok(res, await flashcardsService.stats(req.userId))),
  getById: asyncHandler(async (req, res) => ok(res, await flashcardsService.getById(req.userId, toId(req.params.id)))),
  create: asyncHandler(async (req, res) => created(res, await flashcardsService.create(req.userId, req.body))),
  update: asyncHandler(async (req, res) => ok(res, await flashcardsService.update(req.userId, toId(req.params.id), req.body))),
  review: asyncHandler(async (req, res) => ok(res, await flashcardsService.review(req.userId, toId(req.params.id), req.body))),
  history: asyncHandler(async (req, res) => ok(res, await flashcardsService.history(req.userId, toId(req.params.id)))),
  remove: asyncHandler(async (req, res) => {
    await flashcardsService.remove(req.userId, toId(req.params.id));
    return noContent(res);
  }),
};
