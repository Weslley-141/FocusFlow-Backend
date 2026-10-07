import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok } from '../utils/response';
import { toId } from '../utils/validators';
import { subjectsService } from '../services/subjects.service';

export const subjectsController = {
  list: asyncHandler(async (req, res) => ok(res, await subjectsService.list(req.userId))),
  stats: asyncHandler(async (req, res) => ok(res, await subjectsService.stats(req.userId))),
  getById: asyncHandler(async (req, res) => ok(res, await subjectsService.getById(req.userId, toId(req.params.id)))),
  create: asyncHandler(async (req, res) => created(res, await subjectsService.create(req.userId, req.body))),
  update: asyncHandler(async (req, res) => ok(res, await subjectsService.update(req.userId, toId(req.params.id), req.body))),
  remove: asyncHandler(async (req, res) => {
    await subjectsService.remove(req.userId, toId(req.params.id));
    return noContent(res);
  }),
};
