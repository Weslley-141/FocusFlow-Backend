import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { flashcardsController as c } from '../controllers/flashcards.controller';

const router = Router();
router.use(authenticate);
router.get('/review/due', c.due);
router.get('/stats', c.stats);
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id/history', c.history);
router.post('/:id/review', c.review);
router.get('/:id', c.getById);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
