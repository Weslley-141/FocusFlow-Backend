import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok } from '../utils/response';
import { toId } from '../utils/validators';
import { goalsService } from '../services/goals.service';

export const goalsController = {
  list: asyncHandler(async (req, res) => ok(res, await goalsService.list(req.userId))),
  active: asyncHandler(async (req, res) => ok(res, await goalsService.active(req.userId))),
  stats: asyncHandler(async (req, res) => ok(res, await goalsService.stats(req.userId))),
  getById: asyncHandler(async (req, res) => ok(res, await goalsService.getById(req.userId, toId(req.params.id)))),
  create: asyncHandler(async (req, res) => created(res, await goalsService.create(req.userId, req.body))),
  update: asyncHandler(async (req, res) => ok(res, await goalsService.update(req.userId, toId(req.params.id), req.body))),
  updateProgress: asyncHandler(async (req, res) => ok(res, await goalsService.updateProgress(req.userId, toId(req.params.id), req.body))),
  markAsFailed: asyncHandler(async (req, res) => ok(res, await goalsService.markAsFailed(req.userId, toId(req.params.id)))),
  remove: asyncHandler(async (req, res) => {
    await goalsService.remove(req.userId, toId(req.params.id));
    return noContent(res);
  }),
};
