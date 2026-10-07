import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok } from '../utils/response';
import { toId } from '../utils/validators';
import { topicsService } from '../services/topics.service';

export const topicsController = {
  listBySubject: asyncHandler(async (req, res) =>
    ok(res, await topicsService.listBySubject(req.userId, toId(req.params.subjectId, 'subjectId'))),
  ),
  getById: asyncHandler(async (req, res) => ok(res, await topicsService.getById(req.userId, toId(req.params.id)))),
  create: asyncHandler(async (req, res) => created(res, await topicsService.create(req.userId, req.body))),
  update: asyncHandler(async (req, res) => ok(res, await topicsService.update(req.userId, toId(req.params.id), req.body))),
  remove: asyncHandler(async (req, res) => {
    await topicsService.remove(req.userId, toId(req.params.id));
    return noContent(res);
  }),
};
