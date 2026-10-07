import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { goalsController as c } from '../controllers/goals.controller';

const router = Router();
router.use(authenticate);
router.get('/active', c.active);
router.get('/stats', c.stats);
router.get('/', c.list);
router.post('/', c.create);
router.post('/:id/progress', c.updateProgress);
router.post('/:id/fail', c.markAsFailed);
router.get('/:id', c.getById);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
