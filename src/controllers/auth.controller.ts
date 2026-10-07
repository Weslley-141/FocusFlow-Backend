import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/response';
import { authService } from '../services/auth.service';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { message } = await authService.register(req.body);
    return created(res, null, message);
  }),
  verifyEmail: asyncHandler(async (req, res) => {
    const { message } = await authService.verifyEmail(req.query.token);
    return ok(res, null, message);
  }),
  login: asyncHandler(async (req, res) => ok(res, await authService.login(req.body))),
  me: asyncHandler(async (req, res) => ok(res, await authService.getMe(req.userId))),
  updateProfile: asyncHandler(async (req, res) => ok(res, await authService.updateProfile(req.userId, req.body))),
};
