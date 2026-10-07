import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { pomodoroController as c } from '../controllers/pomodoro.controller';

const router = Router();
router.use(authenticate);
router.get('/completed', c.completed);
router.get('/active', c.active);
router.get('/stats', c.stats);
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id/complete', c.complete);
router.get('/:id', c.getById);
router.delete('/:id', c.remove);
export default router;
