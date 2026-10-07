import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok } from '../utils/response';
import { toId } from '../utils/validators';
import { pomodoroService } from '../services/pomodoro.service';

export const pomodoroController = {
  create: asyncHandler(async (req, res) => created(res, await pomodoroService.create(req.userId, req.body))),
  list: asyncHandler(async (req, res) => ok(res, await pomodoroService.list(req.userId))),
  completed: asyncHandler(async (req, res) => ok(res, await pomodoroService.completed(req.userId))),
  active: asyncHandler(async (req, res) => ok(res, await pomodoroService.active(req.userId))),
  stats: asyncHandler(async (req, res) => ok(res, await pomodoroService.stats(req.userId))),
  getById: asyncHandler(async (req, res) => ok(res, await pomodoroService.getById(req.userId, toId(req.params.id)))),
  complete: asyncHandler(async (req, res) => ok(res, await pomodoroService.complete(req.userId, toId(req.params.id)))),
  remove: asyncHandler(async (req, res) => {
    await pomodoroService.remove(req.userId, toId(req.params.id));
    return noContent(res);
  }),
};
